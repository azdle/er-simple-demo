--#ENDPOINT GET /debug/party_people
wsdebug("called party_people")
return get_kv_list("party_people", full_id)

--#ENDPOINT GET /debug/list
local key = tostring(request.parameters.key or "subscribers")
local resp = Keystore.command{key = key, command = "lrange", args = {0, -1}}
return resp.value

--#ENDPOINT GET /debug/del
local key = tostring(request.parameters.key)
local resp = Keystore.delete{key = key}
return resp

--#ENDPOINT GET /debug/party_start
resp = Timer.sendInterval{
  message = {
    pid = "ta7lsaumvswz5mi"
  },
  duration = 1000,
  timer_id = "party_tick"
}
return resp



--#ENDPOINT GET /debug/scratch
return get_device_list({"count", "leds"})
--return get_device_list_full_with_data({"count", "leds"}, "ta7lsaumvswz5mi")

--#ENDPOINT GET /debug/writeall
local value = tostring(request.parameters.value)
local name = tostring(request.parameters.name)
local pid = tostring(request.parameters.pid or "ta7lsaumvswz5mi")

write_all_called(pid, name, value)

--#ENDPOINT GET /debug/write
local value = tostring(request.parameters.value)

local wg_args = {}

for i,rid in ipairs(lookup_all_dataport_called("party_leds", "ta7lsaumvswz5mi")) do
  table.insert(wg_args, {rid, tonumber(value)})
end

wsdebug(wg_args)

resp = Device.rpcCall({
  pid = "ta7lsaumvswz5mi",
  auth = {},
  calls = {{
    id = "1",
    procedure = "writegroup",
    arguments = {wg_args[1]}
  }}
})

-- local resp = Device.write{ 
--   pid = "ta7lsaumvswz5mi", 
--   device_sn = "d8803975c533",
--   values = '{"party_leds": 3}'
-- }

return resp

--#ENDPOINT GET /debug/subscribers
return get_kv_list("subscribers")

--#ENDPOINT GET /debug/exec
return assert(loadstring("return 1"))()


--#ENDPOINT POST /debug/flush-subscribers
Keystore.command{key = "subscribers", command = "lrem", args = {0, "moop"}}

--#ENDPOINT GET /development/storage/keyvalue
-- Description: Show current key-value data for a specific unique device or for full solution
-- Parameters: ?device=<uniqueidentifier>
local identifier = tostring(request.parameters.device)

if identifier == 'all' or identifier == "nil" then
  local response_text = 'Getting Key Value Raw Data for: Full Solution: \r\n'
  local resp = Keystore.list()
  --response_text = response_text..'Solution Keys\r\n'..to_json(resp)..'\r\n'
  if resp['keys'] ~= nil then
    local num_keys = #resp['keys']
    local n = 1 --remember Lua Tables start at 1.
    while n <= num_keys do
      local id = resp['keys'][n]
      local response = Keystore.get({key = id})
      response_text = response_text..id..'\r\n'
      --response_text = response_text..'Data: '..to_json(response['value'])..'\r\n'
      -- print out each value on new line
      for key,val in pairs(from_json(response['value'])) do
        response_text = response_text.. '   '..key..':'.. val ..'\r\n'
      end
      n = n + 1
    end
  end
  return response_text
else
  local resp = Keystore.get({key = "identifier_" .. identifier})
  return 'Getting Key Value Raw Data for: Device Identifier: '..identifier..'\r\n'..to_json(resp)
end

--#ENDPOINT GET /development/storage/timeseries
-- Description: Show current time-series data for a specific unique device
-- Parameters: ?identifier=<uniqueidentifier>
local identifier = tostring(request.parameters.identifier)

if true then
  local data = {}
  -- Assumes temperature and humidity data device resources
  out = Timeseries.query({
    epoch='ms',
    q = "SELECT value FROM count WHERE identifier = '" ..identifier.."' LIMIT 1"})
  data['timeseries'] = out

  return 'Getting Last 20 Time Series Raw Data Points for: '..identifier..'\r\n'..to_json(out)
else
  http_error(403, response)
end


--#ENDPOINT GET /devices/data
-- Description: Get timeseries data for specific device
-- Parameters: ?identifier=<uniqueidentifier>&window=<number>
if request.parameters.identifier == nil then
  return {
    code = 400,
    message = "identifier parameter required"
  }
end

local identifier = tostring(request.parameters.identifier) -- ?identifier=<uniqueidentifier>
local window = tostring(request.parameters.window) -- in minutes,if ?window=<number>

if window == nil then window = '30' end
-- Assumes temperature and humidity data device resources
resp = Timeseries.query({
  epoch='ms',
    q = "SELECT * FROM count WHERE identifier = '" ..identifier.."' LIMIT 5000"})

resp[1] = identifier
return resp.results


--#ENDPOINT POST /devices/data
-- Description: Set values
-- Parameters: ?identifier=<sn>&<name_n>=<value_n>
if request.parameters.identifier == nil then
  return {
    code = 400,
    message = "identifier parameter required"
  }
end

local identifier = tostring(request.parameters.identifier) -- ?identifier=<uniqueidentifier>

resp = Timeseries.query({
  epoch='ms',
    q = "SELECT * FROM count WHERE identifier = '" ..identifier.."' LIMIT 5000"})

resp[1] = identifier
return resp.results

--#ENDPOINT GET /devices
-- Description: Get timeseries data for specific device
-- Parameters: ?identifier=<uniqueidentifier>&window=<number>
--   window: minutes
return {
  type = "state",
  data = get_device_list({'count', 'leds', 'display', 'temperature', 'humidity'}, nil)
}

--#ENDPOINT WEBSOCKET /listen
-- Description: listen for all changes to all devices
response.message = handle_ws_event(websocketInfo)

--#ENDPOINT WEBSOCKET /debug
response.message = handle_debug_event(websocketInfo)