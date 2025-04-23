
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
  const type = document.getElementById("type").value;

  const user = firebase.auth().currentUser;
    const userId = user.uid;
    const snapshot = await db.collection("textbooks").doc("allTextbooks").collection("books").get();
    const temp = []

    snapshot.forEach(doc => {
      const data = doc.data();
      temp.push({
        id: doc.id, // or a unique counter if needed
        title: data.name || "Untitled",
        author: data.author || "Unknown",
        price: data.price || 0.0,
        type: data.type,
        image: data.photo || "https://via.placeholder.com/100"
      });
    });

  // Create a new textbook object
  const textbookData = {
    user: firebase.auth().currentUser.uid,
    id: temp.length,
    name: name,
    author: author,
    price: price,
    type: type,
    photo: photo,
    timestamp: firebase.firestore.FieldValue.serverTimestamp(),
  };

  // Add the new textbook to Firestore
  await db.collection("textbooks").doc("allTextbooks").collection("books").add(textbookData);
  await db.collection("textbooks").doc("sellingTextbooks").collection("books").add(textbookData);

  // Reload the page to show the new listing
  location.reload();
});

async function deleteAccountFirestore() {
  const user = firebase.auth().currentUser;

  if (!user) {
    alert("No user is currently signed in.");
    return;
  }

  const userId = user.uid;

  try {
    // Step 1: Delete books from allTextbooks
    const allBooksSnapshot = await db.collection("textbooks").doc("allTextbooks").collection("books").where("user", "==", userId).get();
    const sellingBooksSnapshot = await db.collection("textbooks").doc("sellingTextbooks").collection("books").where("user", "==", userId).get();

    const deletePromises = [];

    allBooksSnapshot.forEach((doc) => {
      deletePromises.push(doc.ref.delete());
    });

    sellingBooksSnapshot.forEach((doc) => {
      deletePromises.push(doc.ref.delete());
    });

    await Promise.all(deletePromises);
    console.log("User's books deleted.");

    // Step 2: Delete user document in Users collection
    await db.collection("Users").doc(userId).delete();
    console.log("User document deleted.");

    // Step 3: Delete user from Firebase Authentication
    await user.delete();

    alert("Your account and all associated data have been deleted.");
    window.location.href = "index.html";

  } catch (error) {
    if (error.code === 'auth/requires-recent-login') {
      alert("Please re-login and try again. This action requires a recent login for security.");
    } else {
      console.error("Error deleting account:", error);
      alert("An error occurred while deleting the account.");
    }
  }
}

const updateFormBtn = document.getElementById("openUpdatePopUp");
const popup = document.getElementById("updateFormPopup");
const closePopup = document.getElementById("closePopup");
const updateForm = document.getElementById("updateForm");

const bookId = 0;

// Open the popup form when the button is clicked
function openUpdatePopUp(id){
  popup.style.display = "block";
  bookID = id;
};

// Close the popup form
closePopup.addEventListener("click", () => {
  popup.style.display = "none";
});

updateForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  // Get form values
  const name = document.getElementById("textbookNameNew").value;
  const author = document.getElementById("authorNew").value;
  const photo = document.getElementById("photoNew").value;
  const price = parseFloat(document.getElementById("priceNew").value);
  const type = document.getElementById("typeNew").value;

  const user = firebase.auth().currentUser;
  const userId = user.uid;

  const textbookData = {
    user: userId,
    name: name,
    author: author,
    price: price,
    type: type,
    photo: photo,
    timestamp: firebase.firestore.FieldValue.serverTimestamp(),
  };

  try {
    // Query for docs that have id == bookId
    const textbookQuerySnapshot = await db
      .collection("textbooks")
      .doc("allTextbooks")
      .collection("books")
      .where("id", "==", bookId)
      .get();

    const sellingTextbookQuerySnapshot = await db
      .collection("textbooks")
      .doc("sellingTextbooks")
      .collection("books")
      .where("id", "==", bookId)
      .get();

    // Update all matching textbooks in both collections
    const updatePromises = [];

    textbookQuerySnapshot.forEach((doc) => {
      updatePromises.push(doc.ref.update(textbookData));
    });

    sellingTextbookQuerySnapshot.forEach((doc) => {
      updatePromises.push(doc.ref.update(textbookData));
    });

    await Promise.all(updatePromises);

    // Reload the page after updates
    location.reload();
  } catch (error) {
    console.error("Error updating textbooks:", error);
  }
});


firebase.auth().onAuthStateChanged(function(user) {
  if (user) {
    console.log("logged in");
  }
});

  // Handle form submission to update user data
  async function editProfile(){
    const user = firebase.auth().currentUser;
    const userId = user.uid;
    event.preventDefault();

    const updatedUser = {
      name: document.getElementById("name").value,
      email: document.getElementById("email").value || "",
    };

    try {
      if(email != db.collection("Users").doc(userId).name && document.getElementById("email").value != ""){
        editEmail();
      }
      await db.collection("Users").doc(userId).update(updatedUser);
      alert("Profile updated successfully!");
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Failed to update profile.");
    }
  };

  async function reauthenticateUser(password) {
    const user = firebase.auth().currentUser;
    const credentials = firebase.auth.EmailAuthProvider.credential(user.email, password);
  
    try {
      await user.reauthenticateWithCredential(credentials);
      console.log("Reauthentication successful!");
    } catch (error) {
      console.error("Error reauthenticating user:", error);
      throw new Error("Reauthentication failed. Please check your password.");
    }
  }
  
  async function updateEmailInFirebase(newEmail, password) {
    const user = firebase.auth().currentUser;
  
    try {
      // Step 1: Reauthenticate the user
      await reauthenticateUser(password);
      await user.verifyBeforeUpdateEmail(newEmail);
      alert("A change email link has been sent to the new email address.");
      // Step 2: Update email in Firebase Authentication
      await user.updateEmail(newEmail);
      console.log("Email updated in Firebase Authentication");
    } catch (error) {
      console.error("Error updating email:", error);
      
    }
  }
  
  // Form submission for updating email
  async function editEmail(){
    event.preventDefault();
  
    const newEmail = document.getElementById("email").value;
    const password = prompt("Please enter your password to confirm:");
  
    await updateEmailInFirebase(newEmail, password);
  };