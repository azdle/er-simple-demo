-- websocket listener

-- 
function handle_ws_event(e)
  if e.type == "data" then
    return handle_ws_message(e)
  elseif e.type == "open" then
    return ws_subscribe(e.socket_id, e.server_ip)
  elseif e.type == "close" then
    return ws_unsubscribe(e.socket_id, e.server_ip)
  end
end

function handle_ws_message(e)
  -- check for general errors then switch on type

  local msg = from_json(e.message)

  if type(msg) ~= "table" then
    return {
      type = "error",
      id = msg.id,
      error = "invalid: message must be json"
    }
  elseif msg.type == nil then
    return {
      type = "error",
      id = msg.id,
      error = "invalid: type field not found"
    }
  elseif msg.type == "write" then
    if type(msg.sn) ~= "string" or
       type(msg.name) ~= "string" or
       type(msg.value) ~= "string" then
      return {
        type = "error",
        id = msg.id,
        error = "invalid: required field not found"
      }
    end

    set_values(msg.sn, {[msg.name] = msg.value}, true)

    return {
      type = "response",
      id = msg.id,
      response = "OK"
    }
  else
    return {
      type = "error",
      id = msg.id,
      error = "invalid: unknown type"
    }
  end

  return "messages from client not supported"
end

-- subscribe this websocket, if user has permissions
function ws_subscribe(socket_id, server_ip)
  local full_id = tostring(socket_id) .. "/" .. tostring(server_ip)
  Keystore.command{key = "subscribers", command = "lpush", args = {full_id}}

  return {
    type = "state",
    data = get_device_list({'count', 'leds'}, nil)
  }
end

-- unsubscribe this websocket from this device
function ws_unsubscribe(socket_id, server_ip)
  local full_id = tostring(socket_id) .. "/" .. tostring(server_ip)
  Keystore.command{key = "subscribers", command = "lrem", args = {0 ,full_id}}

  return nil -- no more connection, can't send anything
end
