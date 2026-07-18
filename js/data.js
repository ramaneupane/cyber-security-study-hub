window.SECURITY_HUB_DATA = {
  'data/ports.json': [
    { port: 20, protocol: 'FTP', transport: 'TCP', description: 'File Transfer Protocol data', examTip: 'Used for active mode data transfer' },
    { port: 21, protocol: 'FTP', transport: 'TCP', description: 'File Transfer Protocol control', examTip: 'Often insecure; prefer SFTP' },
    { port: 22, protocol: 'SSH', transport: 'TCP', description: 'Secure shell', examTip: 'Common for remote administration' },
    { port: 53, protocol: 'DNS', transport: 'UDP/TCP', description: 'Domain Name System', examTip: 'Port 53 is widely used for name resolution' },
    { port: 80, protocol: 'HTTP', transport: 'TCP', description: 'Hypertext Transfer Protocol', examTip: 'Unencrypted web traffic' },
    { port: 443, protocol: 'HTTPS', transport: 'TCP', description: 'Secure web traffic', examTip: 'TLS/SSL encrypted web traffic' }
  ],
  'data/acronyms.json': [
    { term: 'CIA', definition: 'Confidentiality, Integrity, Availability' },
    { term: 'MFA', definition: 'Multi-Factor Authentication' },
    { term: 'SIEM', definition: 'Security Information and Event Management' },
    { term: 'VPN', definition: 'Virtual Private Network' },
    { term: 'IDS', definition: 'Intrusion Detection System' },
    { term: 'IPS', definition: 'Intrusion Prevention System' }
  ]
};
