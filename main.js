const fs = require('fs');
const os = require('os');

const node_openssl = require('node-openssl-cert');

const options = {
  binpath: '/mingw64/bin/openssl',
};

const openssl = new node_openssl(options);

const rsakeyoptions = {};

const csroptions = {
  hash: 'sha512',
  subject: {
    countryName: 'US',
    stateOrProvinceName: 'Massachusetts',
    localityName: 'Boston',
    organizationName: 'Suffolk University',
    organizationalUnitName: 'ITS',
    commonName: ['maui.suffolk.edu'],
    emailAddress: 'its.suffolk.edu',
  },
};

openssl.generateRSAPrivateKey(rsakeyoptions, function (err, key, cmd) {
  console.log(cmd);
  console.log(key);
  openssl.generateCSR(csroptions, key, 'test', function (err, csr, cmd) {
    if (err) {
      console.log(err);
    } else {
      console.log(cmd.command);
      console.log(csr);
      console.log(cmd.files.config);
    }
  });
});

// openssl req -new -out maui.csr -newkey rsa:2048 -nodes -sha256 -keyout maui.key
