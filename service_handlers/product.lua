--
-- Product Event Handler
-- Handle data events

wsdebug{product_event = data}

-- make local references
local sn = data.device_sn
local ts = data.value[1]
local name = data.alias
local value = data.value[2]
local pid = data.pid
local rid = data.rid

-- PUT DATA INTO TIME SERIES DATABASE STORAGE:
-- ============================
-- Write All Device Resource Data to timeseries database
local err = Timeseries.write({
  query = name .. ",identifier=" .. sn .. " value=" .. value
})

-- get list of websockets currently subscribed
local subscribers = get_kv_list("subscribers")

for i,full_id in ipairs(subscribers) do
  local msg = {
    type = "update",
    data = {}
  }

  msg.data[sn] = {
    values = {
      [name] = value
    }
  }

  local socket_id, server_ip = string.match(full_id, '([^/]*)/([^/]*)')

  if socket_id ~= nil then
    Websocket.send({
      socket_id = socket_id,
      server_ip = server_ip,
      message = to_json(msg),
      type="data-text"
    })
  end
end

if name == "party_on_off" then
  if value == "0" then
    Device.write({
      values = {party_leds = 0},
      pid = "ta7lsaumvswz5mi",
      device_sn = sn
    })

    -- save RID of devices that wants to party
    local full_id = pid .. "/" .. rid
    del_kv_list("party_people", full_id)
  else
    Device.write({
      alias = "party_leds",
      value = math.random(0,7),
      pid = "ta7lsaumvswz5mi",
      device_sn = sn
    })

    -- device is done partying, remove RID from list
    local full_id = pid .. "/" .. rid
    put_kv_list("party_people", full_id)
  end
end
