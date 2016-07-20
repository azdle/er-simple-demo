function get_device_list( metrics, window )
  local window_str
  if window ~= nil then
    window_str = "time > now() - ".. tostring(window) .."m "
  else
    window_str = ""
  end

  local metrics_str = table.concat(metrics, ",")

  local rtn = Timeseries.query({
    epoch='ms',
    q = "SELECT * FROM " .. metrics_str ..
        " GROUP BY identifier " .. window_str .. "ORDER BY time DESC LIMIT 1"}
  )

  if rtn.results == nil or #rtn.results == 0 then
    return {}
  end

  local resp = {}

  for i,v in ipairs(rtn.results[1].series) do
    local sn = v.tags.identifier
    local ts = v.values[1][1]
    local name = v.name
    local value = v.values[1][2]

    resp[sn] = resp[sn] or {values = {}}
    resp[sn].values[name] = value
  end

  return resp
end

function set_values( sn, values, push_to_device )
  for name,value in pairs(values) do
    wsdebug("set value called")
    if push_to_device == true then
      local rid = lookup_device_rid(sn, "ta7lsaumvswz5mi")

      if rid ~= nil then
        resp = Device.rpcCall({
          pid = "ta7lsaumvswz5mi",
          auth = {client_id = rid},
          calls = {{
            id = "1",
            procedure = "write",
            arguments = {
              {alias = name},
              value
            }
          }}
        })

        wsdebug("rpc resp " .. tostring(resp))
      else
        wsdebug("rid not found for " .. tostring(sn))
      end
    end
    
    -- save value in timeseries db
    local err = Timeseries.write({
      query = name .. ",identifier=" .. sn .. " value=" .. value
    })

    -- get list of websockets currently subscribed
    local subscribers = get_kv_list("subscribers")

    for i,full_id in ipairs(subscribers) do
      -- format message to API spec
      local msg = {
        type = "update",
        data = {}
      }
      msg.data[sn] = {
        values = {
          [name] = value
        }
      }

      -- send message to all all open websockets
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
  end

end

function lookup_device_rid( sn, pid )
  resp = Device.rpcCall({
    pid = pid,
    auth = {},
    calls = {{
      id = "1",
      procedure = "info",
      arguments = {
        {alias = ""},
        {aliases = true}
      }
    }}
  })

  local aliases = resp[1].result.aliases

  for rid,alias_list in pairs(aliases) do
    for i,alias in ipairs(alias_list) do
      if alias == "d8803975c533" then
        return rid
      end
    end
  end

  return nil
end

function lookup_all_dataport_called( name, pid )
  resp = Device.rpcCall({
    pid = pid,
    auth = {},
    calls = {{
      id = "1",
      procedure = "listing",
      arguments = {
        {alias = ""},
        {"client"},
        {}
      }
    }}
  })

  local clients = resp[1].result.client
  local calls = {}

  for i,rid in ipairs(clients) do
    table.insert(calls, {
      id = i,
      procedure = "info",
      arguments = {
        rid,
        {aliases = true}
      }
    })
  end

  resp = Device.rpcCall({
    pid = pid,
    auth = {},
    calls = calls
  })

  local rids = {}

  for i,call_resp in ipairs(resp) do
    local aliases = call_resp.result.aliases
    for rid,alias_list in pairs(aliases) do
      for i,alias in ipairs(alias_list) do
        if alias == name then
          table.insert(rids, rid)
        end
      end
    end
  end

  return rids
end

function lookup_all_dataport_called_with_workaround( name, pid )
  resp = Device.rpcCall({
    pid = pid,
    auth = {},
    calls = {{
      id = "1",
      procedure = "listing",
      arguments = {
        {alias = ""},
        {"client"},
        {}
      }
    }}
  })

  local clients = resp[1].result.client
  local calls = {}

  for i,rid in ipairs(clients) do
    table.insert(calls, {
      id = i,
      procedure = "info",
      arguments = {
        rid,
        {aliases = true}
      }
    })
  end

  resp = Device.rpcCall({
    pid = pid,
    auth = {},
    calls = calls
  })

  local dataports = {}

  for i,call_resp in ipairs(resp) do
    local aliases = call_resp.result.aliases
    for rid,alias_list in pairs(aliases) do
      for i,alias in ipairs(alias_list) do
        if alias == name then
          table.insert(dataports, {
            rid = rid,
            parent_rid = clients[i]
          })
        end
      end
    end
  end

  return dataports
end

function lookup_and_read_all_dataport_called_with_workaround( name, pid )
  resp = Device.rpcCall({
    pid = pid,
    auth = {},
    calls = {{
      id = "1",
      procedure = "listing",
      arguments = {
        {alias = ""},
        {"client"},
        {}
      }
    }}
  })

  local clients = resp[1].result.client
  local calls = {}

  for i,rid in ipairs(clients) do
    table.insert(calls, {
      id = i,
      procedure = "info",
      arguments = {
        rid,
        {aliases = true}
      }
    })
  end

  resp = Device.rpcCall({
    pid = pid,
    auth = {},
    calls = calls
  })

  local dataports = {}

  --wsdebug(clients)

  for i,call_resp in ipairs(resp) do
    local aliases = call_resp.result.aliases
    for rid,alias_list in pairs(aliases) do
      for j,alias in ipairs(alias_list) do
        if alias == name then
          table.insert(dataports, {
            rid = rid,
            parent_rid = clients[i]
          })
        end
      end
    end
  end

  --wsdebug(dataports)

  for i,dataport in ipairs(dataports) do
    resp = Device.rpcCall({
      pid = pid,
      auth = {client_id = dataport.parent_rid},
      calls = {{
        id = "1",
        procedure = "read",
        arguments = {
          dataport.rid,
          {}
        }
      }}
    })

    if resp[1].status == "ok" then
      dataports[i].value = resp[1].result[1][2]
      dataports[i].timestamp = resp[1].result[1][1]
    else
      wsdebug(dataport.parent_rid)
      wsdebug(resp)
    end

  end

  return dataports
end

function write_all_called(pid, name, value)
  for i,dataport in ipairs(lookup_all_dataport_called_with_workaround(name, pid)) do
    resp = Device.rpcCall({
      pid = pid,
      auth = {client_id = dataport.parent_rid},
      calls = {{
        id = "1",
        procedure = "write",
        arguments = {
          dataport.rid,
          value
        }
      }}
    })
  end

  return true
end