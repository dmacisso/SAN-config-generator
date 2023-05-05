console.log('Hello');

//* FORM Event Listener
document.querySelector('#san-form').addEventListener('submit', handleSanSubmit);

document
  .querySelector('button#clear-form')
  .addEventListener('click', document.location.reload);

//* Get a reference to the form inputs
const formInputs = Array.from(document.querySelectorAll('#main-form input'));
const sanInputs = Array.from(document.querySelectorAll('#san-form input'));

//* The download functions
function downloadSingleSubjectConfigFile(filename) {
  console.log('filename: ', filename);
  const blob = new Blob([filename], { type: 'text/plain;charset=utf-8' });
  saveAs(blob, 'single-subject-config.txt');
}

function downloadSANConfigFile(filename) {
  const blob = new Blob([filename], { type: 'text/plain;charset=utf-8' });
  saveAs(blob, 'san-config.txt');
}

function downloadSANScriptFile(cn) {
  const script = new Blob(
    [
      `openssl req -new -out ${cn}.csr -newkey rsa:2048 -nodes -sha256 -keyout ${cn}.key -config san-config.txt`,
    ],
    { type: 'text/plain;charset=utf-8' }
  );
  saveAs(script, 'san-script.txt');
}

function downloadSingleSubjectScriptFile(cn) {
  const script = new Blob(
    [
      // `openssl req -new -out ${cert_data.cn}.csr -newkey rsa:2048 -nodes -sha256 -keyout ${cert_data.cn}.key -config single-subject-config.txt`,
      `openssl req -new -out ${cn}.csr -newkey rsa:2048 -nodes -sha256 -keyout ${cn}.key -config single-subject-config.txt`,
    ],
    { type: 'text/plain;charset=utf-8' }
  );
  saveAs(script, 'single-script.txt');
}

function downloadCSROnlyForSANFromPrivateKey(cn) {
  const script = new Blob(
    [
      `openssl req -out ${cn}.csr -key ${cn}.key -new -config san-config.txt`
    ],
    { type: 'text/plain;charset=utf-8' }
  );
  saveAs(script, 'csr-only-for-san-script.txt');
  
}

function downloadCSROnlyForSingleFromPrivateKey(cn) {
  const script = new Blob(
    [
      `openssl req -out ${cn}.csr -key ${cn}.key -new -config single-subject-config.txt`
    ],
    { type: 'text/plain;charset=utf-8' }
  );
  saveAs(script, 'csr-only-for-single-script.txt');
  
}

//*

function createRecord(hasSANData) {
  console.log('Form submitted');
  // const formInputs = Array.from(document.querySelectorAll('#main-form input'));
  // console.log(formInputs);
  const cert_data = formInputs.reduce(
    (acc, input) => ({ ...acc, [input.id]: input.value }),
    {}
  );
  // console.log(cert_data);
  const record = `
[req]
  distinguished_name = req_distinguished_name
  req_extensions = v3_req
  prompt = no
  [req_distinguished_name]
  C = ${cert_data.country}
  ST = ${cert_data.state}
  L = ${cert_data.city}
  O = ${cert_data.company_name}
  OU = ${cert_data.department}
  CN = ${cert_data.cn}
  [v3_req]
  keyUsage = keyEncipherment, dataEncipherment
  extendedKeyUsage = serverAuth
  `;
  const cn = cert_data.cn;
  if (!hasSANData) {
    downloadSingleSubjectConfigFile(record);
    downloadSingleSubjectScriptFile(cn);
    downloadCSROnlyForSingleFromPrivateKey(cn)
  }
  return { record, cn };
}


//* Add SAN URL's to the DOM
function addNextURL() {
  // initialSanTable()
  const urls = document.querySelectorAll('.dns-input');
  const dnsSubmitButton = document.querySelector('#dns-submit');
  const numUrls = urls.length;
  let nextUrl = numUrls + 1;

  const newURL = `
    <label for="dns${nextUrl}">DNS${nextUrl}</label>
    <input type="text" id="dns${nextUrl}" name="dns${nextUrl}" />
    `;

  // const dnsForm = document.querySelector('.dns-form');
  const dnsInputDivElement = document.createElement('div');
  dnsInputDivElement.classList = ['dns-input'];
  dnsInputDivElement.innerHTML = newURL;
  dnsSubmitButton.insertAdjacentElement('beforebegin', dnsInputDivElement);
}


function handleSanSubmit(e) {
  e.preventDefault();

  //* Get a reference to SAN URLs resulting from user inputs
  const sanInputs = Array.from(document.querySelectorAll('#san-form input'));
  const san_data = sanInputs.reduce(
    (acc, input) => ({ ...acc, [input.id]: input.value }),
    {}
  );

  //* Create a boolean testing for the existence of SAN URLs
  let hasSANData = false;
  if (sanInputs.length > 0) {
    hasSANData = true;
  }

  const { record, cn } = createRecord(hasSANData);

  let altNames = `
  subjectAltName = @alt_names
  [alt_names]
  `;
  let num = 1;
  for (const value of Object.values(san_data)) {
    altNames += `DNS.${num} = ${value}\n`;
    num += 1;
  }

  //* Download SAN files only if a SAN URL is specified
  if (hasSANData) {
    const sanFile = record + altNames;
    downloadSANConfigFile(sanFile);
    downloadSANScriptFile(cn);
    downloadCSROnlyForSANFromPrivateKey(cn)
    console.log(sanFile);
  }
}
