document.addEventListener("DOMContentLoaded", function() {
  const chatToggle = document.getElementById("chat-toggle");
  const chatBox = document.getElementById("chat-box");
  const closeChat = document.getElementById("close-chat");

  chatToggle.addEventListener("click", function() {
      chatBox.style.display = chatBox.style.display === "none" ? "block" : "none";
  });

  closeChat.addEventListener("click", function() {
      chatBox.style.display = "none";
  });
});
