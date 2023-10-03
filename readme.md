
local webserver exposed to internet via cloudflare tunnel
njal.la or similar domain redirect to tunnel port


cloudflared tunnel --url http://localhost:8080

cloudflared tunnel --no-autoupdate --metrics localhost:55567 --url http://localhost:5000



cloudflared tunnel login
 1442* curl -vvv 'https://endorsed-settlement-geological-utc.trycloudflare.com'
 1443  cloudflared tunnel create trashburoearth
 1446  cloudflared tunnel route dns trashburoearth trash.buro.earth
 1448  code ~/.cloudflared/config.yml
 1449  cloudflared tunnel list
 1450  cloudflared tunnel run trashburoearth




 tech:

vue til layout
geohash til coordinate lookups by proximity
gunddb til datalag
nodejs server til persistence






schemas

user: {
    name,
    password
}

heap: {
    created_by_user (not editable),
    image,
    tags: [],
    secret_delete_hash (hash of secret number, used to delete heap),
    suplied_delete_numbers (numbers provided by user to mark something taken)
}

heap_delete_attemp: {
    heap_id,
    created_by_user_id,
    suplied_number,
}

heap_message : {
    heap_id,
    created_by_user_id,
    message
}



check https://gun.eco/docs/RAD#lex for hvordan man kan glemme "gamle data"