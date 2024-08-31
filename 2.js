var bluetooth = null;
// shared UUIDs between MicroPython and JS
const UART_SERVICE_ID = '6E400001-B5A3-F393-E0A9-E50E24DCCA9E'.toLowerCase();
const CHARACTERISTIC_TX = '6E400003-B5A3-F393-E0A9-E50E24DCCA9E'.toLowerCase();
const CHARACTERISTIC_RX = '6E400002-B5A3-F393-E0A9-E50E24DCCA9E'.toLowerCase();

function connectButton() {
  requestDevice();
}

async function requestDevice() {
  console.log('Requesting any Bluetooth Device...');
  var device = await navigator.bluetooth.requestDevice({
    // filters: [...] <- Prefer filters to save energy & show relevant devices.
    acceptAllDevices: true,
    optionalServices: [UART_SERVICE_ID] // TODO
  });
  await connectDevice(device);
  console.log("Device connected");
}

async function onDisconnected() {
  console.log('> Bluetooth Device disconnected');
}

async function connectDevice(device) {
  bluetooth = device;
  await device.addEventListener('gattserverdisconnected', onDisconnected);
  var server = await device.gatt.connect();
  var service = await server.getPrimaryService(UART_SERVICE_ID);
  var characteristic = await service.getCharacteristic(CHARACTERISTIC_TX);
  await characteristic.writeValue(new Uint8Array([0x00]));
  await characteristic.startNotifications();
  characteristic.addEventListener('characteristicvaluechanged', handleNotifications);
}

async function handleNotifications(event) {
  var value = event.target.value;
  var message = new TextDecoder('utf-8').decode(value);
  console.log('Received message: ' + message);
  document.getElementById('logging-info').innerHTML += '<p>' + message + '</p>';
}

async function sendMessage() {
  var message = document.getElementById('log-message-input').value;
  var device = bluetooth;
  var service = await device.gatt.getPrimaryService(UART_SERVICE_ID);
  var characteristic = await service.getCharacteristic(CHARACTERISTIC_TX);
  await characteristic.writeValue(new TextEncoder('utf-8').encode(message));
}
