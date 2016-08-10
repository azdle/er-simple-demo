print(request.message)
print(request.timer_id)
print(request.solution_id)

wsdebug("timer exec")
--wsdebug(request)


if request.timer_id == "party_tick" then
    math.randomseed( os.time() )
    local rval = math.random(1,7)
    resp = lookup_and_read_all_dataport_called_with_workaround(
            "party_on_off", "ta7lsaumvswz5mi" )

    --wsdebug(resp)

    for i,dataport in ipairs(resp) do
        if tonumber(dataport.value) ~= 0 and
           tonumber(dataport.value) ~= nil then
            resp = Device.rpcCall({
              pid = "ta7lsaumvswz5mi",
              auth = {client_id = dataport.parent_rid},
              calls = {{
                id = "1",
                procedure = "write",
                arguments = {
                  {alias = "party_leds"},
                  rval
                }
              }}
            })

            --wsdebug(dataport)
            --wsdebug(resp)
        end
    end
end