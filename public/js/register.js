
document.addEventListener("DOMContentLoaded", function () {
  var passwordField = document.getElementById("password");
  var c_passField = document.getElementById("c_pass");
  var passErrorElement = document.getElementById("passError");

  function validatePasswords() {
    passErrorElement.innerText = passwordField.value !== c_passField.value ? "Passwords do not match" : "";
  }

  passwordField.addEventListener("input", validatePasswords);
  c_passField.addEventListener("input", validatePasswords);
});

document.getElementById("email").addEventListener("input", function () {
  const emailInput = this.value;
  if (emailInput.trim() !== "") {
    checkEmailAvailability(emailInput);
  }
});

function checkEmailAvailability(email) {
  fetch("/checkEmail", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email: email }),
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.exists) {
        document.getElementById("emailError").innerText =
          "Email is already registered.";
      } else {
        document.getElementById("emailError").innerText = "";
      }
    })
    .catch((error) => {
      console.error("Error checking email availability:", error);
    });
}



