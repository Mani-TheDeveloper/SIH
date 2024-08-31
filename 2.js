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
  var devices = await navigator.bluetooth.requestDevice({
    // filters: [...] <- Prefer filters to save energy & show relevant devices.
    acceptAllDevices: true,
    optionalServices: [UART_SERVICE_ID] // TODO
  });
  console.log('Found devices:', devices);
  populateDeviceList(devices);
}

function populateDeviceList(devices) {
  var deviceList = document.getElementById('device-list');
  deviceList.innerHTML = '';
  devices.forEach(device => {
    var listItem = document.createElement('li');
    listItem.textContent = device.name;
    listItem.addEventListener('click', () => {
      connectDevice(device);
    });
    deviceList.appendChild(listItem);
  });
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
  console.log('Connected to device:', device.name);
}

async function onDisconnected() {
  console.log('> Bluetooth Device disconnected');
}

async function handleNotifications(event) {
  var value = event.target.value;
  var message = new TextDecoder('utf-8').decode(value);
  console.log('Received message:', message);
  document.getElementById('logging-info').innerHTML += '<p>' + message + '</p>';
}

async function sendMessage() {
  var message = document.getElementById('log-message-input').value;
  var device = bluetooth;
  var service = await device.gatt.getPrimaryService(UART_SERVICE_ID);
  var characteristic = await service.getCharacteristic(CHARACTERISTIC_TX);
  await characteristic.writeValue(new TextEncoder('utf-8').encode(message));
}
