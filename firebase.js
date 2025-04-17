
const firebaseConfig = {
  apiKey: "AIzaSyCjqyPZyH9di_gyAUgECuSHTw90ji9TOqI",
  authDomain: "swegroup7-3815e.firebaseapp.com",
  projectId: "swegroup7-3815e",
  storageBucket: "swegroup7-3815e.firebasestorage.app",
  messagingSenderId: "449830843239",
  appId: "1:449830843239:web:97d958dbab1080fea435c2"
};
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

async function login() {
    event.preventDefault();
    const email = document.getElementById("loginEmail").value;
    const password = document.getElementById("loginPassword").value;
    const loginMessage = document.getElementById("loginMessage");

    try {
        await firebase.auth().signInWithEmailAndPassword(email, password);

        loginMessage.textContent = 'Login successful! Redirecting...';
       loginMessage.classList.remove('hide', 'error');
       loginMessage.classList.add('success');

       setTimeout(() => {
         window.location.href = 'dashboard.html';
       }, 1500);

    } catch (error) {
        console.error("Error logging in:", error);
        loginMessage.textContent = "Invalid Login";
        loginMessage.classList.remove('hide', 'success');
        loginMessage.classList.add('error');
    }
}

async function signup() {
    event.preventDefault();
    const email = document.getElementById("registerEmail").value;
    const password = document.getElementById("registerPassword").value;
    const name = document.getElementById("registerName").value;
    const registerMessage = document.getElementById("registerMessage");

    try {
        await firebase.auth().createUserWithEmailAndPassword(email, password);
        await db.collection("Users").doc(firebase.auth().currentUser.uid).set({
            email: email,
            name: name,
        });

        registerMessage.textContent = 'Registration successful! Redirecting to login...';
       registerMessage.classList.remove('hide', 'error');
       registerMessage.classList.add('success');

        setTimeout(() => {
            registerForm.classList.add('hide');
            loginForm.classList.remove('hide');
            window.location.href = "dashboard.html";
        }, 1500);

    } catch (error) {
        console.error("Error signing up:", error);
        registerMessage.textContent = "Error Signing Up";
        registerMessage.classList.remove('hide', 'success');
        registerMessage.classList.add('error');
    }
}

async function logOut() {
    try {
        await firebase.auth().signOut();
        console.log('User signed out successfully');
        window.location.href = 'index.html';
    } catch (error) {
        console.error('Error signing out:', error);
    }
}

const openFormBtn = document.getElementById("openFormBtn");
const popupForm = document.getElementById("popupForm");
const closePopupBtn = document.getElementById("closePopupBtn");
const textbookForm = document.getElementById("textbookForm");

// Open the popup form when the button is clicked
openFormBtn.addEventListener("click", () => {
  popupForm.style.display = "block";
});

// Close the popup form
closePopupBtn.addEventListener("click", () => {
  popupForm.style.display = "none";
});

// Handle form submission
textbookForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  // Get form values
  const name = document.getElementById("textbookName").value;
  const author = document.getElementById("author").value;
  const photo = document.getElementById("photo").value;
  const price = parseFloat(document.getElementById("price").value);

  // Create a new textbook object
  const textbookData = {
    name: name,
    author: author,
    price: price,
    photo: photo,
    timestamp: firebase.firestore.FieldValue.serverTimestamp(),
  };

  // Add the new textbook to Firestore
  await db.collection("textbooks").doc("allTextbooks").collection("books").add(textbookData);
  await db.collection("textbooks").doc("sellingTextbooks").collection("books").add(textbookData);

  // Reload the page to show the new listing
  location.reload();
});