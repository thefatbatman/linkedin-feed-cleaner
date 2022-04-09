// Initialize button with user's preferred color
let cleanLinkedIn = document.getElementById("cleanLinkedIn");

// When the button is clicked, inject linkedInScripts into current page
cleanLinkedIn.addEventListener("click", async () => {
  let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    function: linkedInScripts
  });
});

function linkedInScripts() {
  var delayBeforeBlocking = 5000;

  // TODO: Get this from API
  var memberList = [
    // {
    //   memberId: "",
    //   name: "",
    //   linkedInProfileURL: "",
    // },
    // {
    //   memberId: "",
    //   name: "",
    //   linkedInProfileURL: "",
    // }
  ];

  function _addToastNotificationHTMLToPage() {
    var div = document.createElement("div");
    div.id = "snackbar";
    document.body.appendChild(div);
  }

  function _showToastNotification(message, className) {
    // Get the snackbar DIV
    var x = document.getElementById("snackbar");

    var completeClassName = "show " + className;

    // Add the "show" class to DIV
    x.className = completeClassName;
    x.innerHTML = message;

    // After 3 seconds, remove the show class from DIV
    setTimeout(function () { x.className = x.className.replace(completeClassName, ""); }, 3000);
  }

  function _makeACallToBlockMemberOnLinkedIn(member) {
    var cookies = document.cookie;

    var csrfToken = _getCSRFToken().slice(1, -1);
    console.log(csrfToken);
    var linkedinBlockProfileEndpoint = `https://www.google.com/psettings/member-blocking/block?memberId=${member.memberId}&trk=block-profile&csrfToken=${csrfToken}`;

    fetch(linkedinBlockProfileEndpoint, {
      method: "POST",
      headers: {
        "Host": "www.linkedin.com",
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:100.0) Gecko/20100101 Firefox/100.0",
        "Accept": "*/*",
        "Accept-Language": "en-US,en;q=0.5",
        "Accept-Encoding": "gzip, deflate, br",
        "X-IsAJAXForm": "1",
        "csrf-token": csrfToken,
        "Origin": "https://www.linkedin.com",
        "Connection": "keep-alive",
        "Cookie": cookies,
        "Sec-Fetch-Dest": "empty",
        "Sec-Fetch-Mode": "cors",
        "Sec-Fetch-Site": "same-origin",
        "Pragma": "no-cache",
        "Cache-Control": "no-cache",
        "Content-Length": "0",
        "TE": "trailers",
      }
    }
    ).then(response => {
      console.log("Blocked that motherfucker: ", member.name);
      _showToastNotification(`Successfully blocked: ${member.name}`, "success");
      console.log(response);
    }).catch(error => {
      _showToastNotification(`Failed to block: ${member.name}`, "error");
      console.log(error);
    });
  }

  function _getCSRFToken() {
    var csrfToken;
    document.cookie.split(";").forEach(cookie => {
      var cookieObject = cookie.split("=");
      if (cookieObject[0].trim() == "JSESSIONID") {
        csrfToken = cookieObject[1];
      }
    });

    return csrfToken;
  }

  function _runForEachItemInArrayWithDelay(array, delay, callback) {
    array.forEach((item, index) => {
      setTimeout(() => {
        callback(item);
      }, delay * (index + 1));
    });
  }

  function _loadLinkedInBlockedkProfileList() {
    var blockedProfileList = [];

    // TODO: Replace the URL with the URL from github.
    fetch(``, {
      method: "GET"
    }).then(response => {
      return response.json();
    }).then(data => {
      blockedProfileList = data;
      console.log(blockedProfileList);
    }).catch(error => {
      console.log(error);
    });

    return blockedProfileList;
  }

  function _init() {

    _addToastNotificationHTMLToPage();

    _loadLinkedInBlockedkProfileList();

    _runForEachItemInArrayWithDelay(memberList, delayBeforeBlocking, _makeACallToBlockMemberOnLinkedIn);
  }

  _init();
}