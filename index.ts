import * as Web3Providers from 'web3-providers';

const MESH_WS_PORT = 60557;
const MESH_WS_ENDPOINT = `ws://localhost:${MESH_WS_PORT}`;

interface StringifiedSignedOrder {
    senderAddress: string;
    makerAddress: string;
    takerAddress: string;
    makerFee: string;
    takerFee: string;
    makerAssetAmount: string;
    takerAssetAmount: string;
    makerAssetData: string;
    takerAssetData: string;
    salt: string;
    exchangeAddress: string;
    feeRecipientAddress: string;
    expirationTimeSeconds: string;
    signature: string;
}

enum OrderEventKind {
    Invalid = 'INVALID',
    Added = 'ADDED',
    Filled = 'FILLED',
    Fully_filled = 'FULLY_FILLED',
    Cancelled = 'CANCELLED',
    Expired = 'EXPIRED',
    Unfunded = 'UNFUNDED',
    Fillability_increased = 'FILLABILITY_INCREASED',
}

interface OrderEventPayload {
    subscription: string;
    result: OrderEvent[];
}

interface OrderEvent {
    orderHash: string;
    signedOrder: StringifiedSignedOrder;
    kind: OrderEventKind;
    fillableTakerAssetAmount: string;
    txHash: string;
}

interface AcceptedOrderInfo {
    orderHash: string;
    signedOrder: StringifiedSignedOrder;
    fillableTakerAssetAmount: string;
}

enum RejectedKind {
    Zeroex_validation = 'ZEROEX_VALIDATION',
    Mesh_error = 'MESH_ERROR',
    Mesh_validation = 'MESH_VALIDATION',
}

enum RejectedCode {
    InternalError = 'InternalError',
    MaxOrderSizeExceeded = 'MaxOrderSizeExceeded',
    OrderAlreadyStored = 'OrderAlreadyStored',
    OrderForIncorrectNetwork = 'OrderForIncorrectNetwork',
    NetworkRequestFailed = 'NetworkRequestFailed',
    OrderHasInvalidMakerAssetAmount = 'OrderHasInvalidMakerAssetAmount',
    OrderHasInvalidTakerAssetAmount = 'OrderHasInvalidTakerAssetAmount',
    OrderExpired = 'OrderExpired',
    OrderFullyFilled = 'OrderFullyFilled',
    OrderCancelled = 'OrderCancelled',
    OrderUnfunded = 'OrderUnfunded',
    OrderHasInvalidMakerAssetData = 'OrderHasInvalidMakerAssetData',
    OrderHasInvalidTakerAssetData = 'OrderHasInvalidTakerAssetData',
    OrderHasInvalidSignature = 'OrderHasInvalidSignature',
}

interface RejectedStatus {
    code: RejectedCode;
    message: string;
}

interface RejectedOrderInfo {
    orderHash: string;
    signedOrder: StringifiedSignedOrder;
    kind: RejectedKind;
    status: RejectedStatus;
}

interface ValidationResults {
    accepted: AcceptedOrderInfo[];
    rejected: RejectedOrderInfo[];
}

console.log('Mesh WebSocket endpoint: ', MESH_WS_ENDPOINT);

(async () => {
    // Instantiate the WebSocket provider/client
    const websocketProvider = new Web3Providers.WebsocketProvider(MESH_WS_ENDPOINT);

    // Subscribe to the order events subscription
    console.log('About to subscribe to heartbeat...');
    const heartbeatSubscriptionId = await websocketProvider.subscribe('mesh_subscribe', 'heartbeat', []);
    console.log('Heartbeat subscriptionId', heartbeatSubscriptionId);
    // Listen to event on the subscription (topic is the subscriptionId)
    const heartbeatCallback = (heartbeat: string) => {
        console.log('Received:', heartbeat);
    };
    websocketProvider.on(heartbeatSubscriptionId, heartbeatCallback as any);

    console.log('About to subscribe to order events...');
    const orderEventsSubscriptionId = await websocketProvider.subscribe('mesh_subscribe', 'orders', []);
    console.log('Order events subscriptionId', orderEventsSubscriptionId);
    // Listen to event on the subscription (topic is the subscriptionId)
    const orderEventsCallback = (eventPayload: OrderEventPayload) => {
        console.log('Received:', JSON.stringify(eventPayload, null, '\t'));
    };
    websocketProvider.on(orderEventsSubscriptionId, orderEventsCallback as any);

    // Submit an order to the Mesh node
    console.log('About to send order...');
    var order = {
        makerAddress: '0xa3ece5d5b6319fa785efc10d3112769a46c6e149',
        takerAddress: '0x0000000000000000000000000000000000000000',
        makerAssetAmount: '100000000000000000000',
        takerAssetAmount: '100000000000000000000000',
        expirationTimeSeconds: '1559856615025',
        makerFee: '0',
        takerFee: '0',
        feeRecipientAddress: '0x0000000000000000000000000000000000000000',
        senderAddress: '0x0000000000000000000000000000000000000000',
        salt: '46108882540880341679561755865076495033942060608820537332859096815711589201849',
        makerAssetData: '0xf47261b0000000000000000000000000e41d2489571d322189246dafa5ebde1f4699f498',
        takerAssetData: '0xf47261b0000000000000000000000000c02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
        exchangeAddress: '0x4f833a24e1f95d70f028921e27040ca56e09ab0b',
        signature:
            '0x1c52f75daa4bd2ad9e6e8a7c35adbd089d709e48ae86463f2abfafa3578747fafc264a04d02fa26227e90476d57bca94e24af32f1cc8da444bba21092ca56cd85603',
    };
    var payload = {
        jsonrpc: '2.0',
        id: 2,
        method: 'mesh_addOrders',
        params: [[order]],
    };
    console.log('mesh_addOrders Payload:', JSON.stringify(payload, null, '\t'));
    const response: ValidationResults = await (websocketProvider as any).sendPayload(payload);
    console.log('mesh_addOrders Response: ', JSON.stringify(response, null, '\t'));
})();