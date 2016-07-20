-- Print contents of `tbl`, with indentation.
-- `indent` sets the initial level of indentation.
function tprint (tbl, indent)
  if not indent then indent = 0 end
  for k, v in pairs(tbl) do
    formatting = string.rep("  ", indent) .. k .. ": "
    if type(v) == "table" then
      print(formatting)
      tprint(v, indent+1)
    elseif type(v) == 'boolean' then
      print(formatting .. tostring(v))      
    else
      print(formatting .. v)
    end
  end
end


--[[--[[--[[--[[--[[--[[--[[--[[--[[--[[--[[--[[--[[--[[--[[--[[--[[--[[--[[--[[

 Set Helpers

--]]--]]--]]--]]--]]--]]--]]--]]--]]--]]--]]--]]--]]--]]--]]--]]--]]--]]--]]--]]
function get_kv_set(key)
  local resp = Keystore.command{key = key, command = "smembers"}
  return resp.value
end

function put_kv_set(key, member)
  local resp = Keystore.command{key = key, command = "sadd", args = {member}}
  return resp
end

function del_kv_set(key, member)
  local resp = Keystore.command{key = key, command = "srem", args = {member}}
  return resp
end

--[[--[[--[[--[[--[[--[[--[[--[[--[[--[[--[[--[[--[[--[[--[[--[[--[[--[[--[[--[[

 List Helpers

--]]--]]--]]--]]--]]--]]--]]--]]--]]--]]--]]--]]--]]--]]--]]--]]--]]--]]--]]--]]
function get_kv_list(key)
  local resp = Keystore.command{key = key, command = "lrange", args = {0,-1}}
  return resp.value
end

function put_kv_list(key, member)
  local resp = Keystore.command{key = key, command = "lpush", args = {member}}
  return resp
end

function del_kv_list(key, member)
  local resp = Keystore.command{key = key, command = "lrem", args = {0, member}}
  return resp
end

--[[--[[--[[--[[--[[--[[--[[--[[--[[--[[--[[--[[--[[--[[--[[--[[--[[--[[--[[--[[

 RPC Helpers

--]]--]]--]]--]]--]]--]]--]]--]]--]]--]]--]]--]]--]]--]]--]]--]]--]]--]]--]]--]]
function deviceRpcCall(sn, procedure, args)
  local ret = Device.rpcCall({pid = device.pid, auth = {client_id = device.rid}, calls = {{
    id = "1",
    procedure = procedure,
    arguments = args
  }}})
  return ret[1]
end

function write(sn, alias, value)
  return deviceRpcCall(sn, "write", {
    {alias = alias},
    value
  })
end