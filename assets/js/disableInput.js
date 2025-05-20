// Disable input from users (Windows & Mac)
document.onkeydown = function (event) {
  // For Mac, metaKey is the Command key
  const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
  const ctrlOrCmd = isMac ? event.metaKey : event.ctrlKey;

  // Disable F12
  if (event.keyCode == 123) {
    return false;
  }
  // Disable Ctrl/Cmd+Shift+I (DevTools)
  if (ctrlOrCmd && event.shiftKey && event.keyCode == 73) {
    return false;
  }
  // Disable Ctrl/Cmd+Shift+C (DevTools)
  if (ctrlOrCmd && event.shiftKey && event.keyCode == 67) {
    return false;
  }
  // Disable Ctrl/Cmd+Shift+J (DevTools)
  if (ctrlOrCmd && event.shiftKey && event.keyCode == 74) {
    return false;
  }
  // Disable Ctrl/Cmd+U (View Source)
  if (ctrlOrCmd && event.keyCode == 85) {
    return false;
  }
  // Disable Ctrl/Cmd+S (Save)
  if (ctrlOrCmd && event.keyCode == 83) {
    event.preventDefault();
    return false;
  }
  // Disable Ctrl/Cmd+P (Print)
  if (ctrlOrCmd && event.keyCode == 80) {
    event.preventDefault();
    return false;
  }
  // Disable Ctrl/Cmd+Shift+K (Console in Firefox)
  if (ctrlOrCmd && event.shiftKey && event.keyCode == 75) {
    return false;
  }
};

if (document.addEventListener) {
  document.addEventListener(
    "contextmenu",
    function (e) {
      e.preventDefault();
    },
    false
  );
} else {
  document.attachEvent("oncontextmenu", function () {
    window.event.returnValue = false;
  });
}

// Disable text selection
document.addEventListener('selectstart', function(e) {
  e.preventDefault();
}, false);

console.clear();
console.log("Congratulations, you've achieved ultimate nerd status. Impressive 😂👌👍");
