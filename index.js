const Web3Providers = require("web3-providers");

const MESH_WS_PORT = 60557;
const MESH_WS_ENDPOINT = `ws://localhost:${MESH_WS_PORT}`;
console.log("Mesh WebSocket endpoint: ", MESH_WS_ENDPOINT);

// Instantiate the WebSocket provider/client
const websocketProvider = new Web3Providers.WebsocketProvider(MESH_WS_ENDPOINT);

// Subscribe to the order events subscription
console.log("About to subscribe to heartbeat...");
websocketProvider
  .subscribe("mesh_subscribe", "heartbeat", [])
  .then(function(subscriptionId) {
    console.log("Heartbeat subscriptionId", subscriptionId);
    // Listen to event on the subscription (topic is the subscriptionId)
    websocketProvider.on(subscriptionId, function(heartbeat) {
      console.log("Received:", heartbeat);
    });
  });

console.log("About to subscribe to order events...");
websocketProvider
  .subscribe("mesh_subscribe", "orders", [])
  .then(function(subscriptionId) {
    console.log("Order events subscriptionId", subscriptionId);
    // Listen to event on the subscription (topic is the subscriptionId)
    websocketProvider.on(subscriptionId, function(events) {
      console.log("Received:", JSON.stringify(events, null, "\t"));
    });

    // Submit an order to the Mesh node
    console.log("About to send order...");
    var order = {
      makerAddress: "0xa3ece5d5b6319fa785efc10d3112769a46c6e149",
      takerAddress: "0x0000000000000000000000000000000000000000",
      makerAssetAmount: "100000000000000000000",
      takerAssetAmount: "100000000000000000000000",
      expirationTimeSeconds: "1559856615025",
      makerFee: "0",
      takerFee: "0",
      feeRecipientAddress: "0x0000000000000000000000000000000000000000",
      senderAddress: "0x0000000000000000000000000000000000000000",
      salt:
        "46108882540880341679561755865076495033942060608820537332859096815711589201849",
      makerAssetData:
        "0xf47261b0000000000000000000000000e41d2489571d322189246dafa5ebde1f4699f498",
      takerAssetData:
        "0xf47261b0000000000000000000000000c02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
      exchangeAddress: "0x4f833a24e1f95d70f028921e27040ca56e09ab0b",
      signature:
        "0x1c52f75daa4bd2ad9e6e8a7c35adbd089d709e48ae86463f2abfafa3578747fafc264a04d02fa26227e90476d57bca94e24af32f1cc8da444bba21092ca56cd85603"
    };
    var payload = {
      jsonrpc: "2.0",
      id: 2,
      method: "mesh_addOrders",
      params: [[order]]
    };
    console.log("mesh_addOrders Payload:", JSON.stringify(payload, null, "\t"));
    websocketProvider.sendPayload(payload).then(function(response) {
      console.log(
        "mesh_addOrders Response: ",
        JSON.stringify(response, null, "\t")
      );
    });
  })
  .catch(function(err) {
    console.log("Error:", err);
  });
