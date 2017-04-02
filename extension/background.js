'use strict';

const clientId = 'client_id';

let createdTabId;

chrome.tabs.create({
  url:
    'https://accounts.google.com/o/oauth2/v2/auth?' + [
      `client_id=${encodeURIComponent(clientId)}`,
      `redirect_uri=${encodeURIComponent('urn:ietf:wg:oauth:2.0:oob:auto')}`,
      'response_type=code',
      `scope=${encodeURIComponent('https://www.googleapis.com/auth/analytics.readonly')}`,
      'access_type=offline',
    ].join('&'),
}, function(tab) {
  createdTabId = tab.id;

  chrome.tabs.onUpdated.addListener(onUpdated);
});

async function onUpdated(tabId, changeInfo, tab) {
  if (tabId !== createdTabId) {
    return;
  }

  if (!/^Success code/i.test(changeInfo.title)) {
    return;
  }

  chrome.tabs.onUpdated.removeListener(onUpdated);
  chrome.tabs.remove(tabId, function() {
    console.log('close tab');
  });

  console.log(changeInfo.title);

  const authorizationCode = changeInfo.title.slice(changeInfo.title.indexOf('=') + 1);

  console.log(authorizationCode);

  try {
    const response = await fetch('https://www.googleapis.com/oauth2/v4/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: [
        `code=${encodeURIComponent(authorizationCode)}`,
        `client_id=${encodeURIComponent(clientId)}`,
        `redirect_uri=${encodeURIComponent('urn:ietf:wg:oauth:2.0:oob:auto')}`,
        'grant_type=authorization_code',
      ].join('&'),
    });

    const data = await response.json();

    console.log(data);
  } catch(e) {
    console.error(e);
  }
}
