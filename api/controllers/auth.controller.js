

//A. The SIGNUP

//Defines an async signup function that:
// 1. Extracts username, password, and email from request body
// 2. Validates inputs
// 3. Checks for existing users
// 4. Hashes the password
// 5. Creates and saves a new user
// 6. Responds with success message

import bcrypt from "bcrypt";
import User from "../models/user.model.js";   


export const signup = async (req, res) => {
  try {
    const { name, password, email } = req.body;

    // Enhanced input validation
    if (!name?.trim() || !password?.trim() || !email?.trim()) {  // Validates that username, password, and email are provided, not empty, and not just whitespace. 
      return res.status(400).json({  // Returns a 400 Bad Request with an error message if validation fails.
        error: "All fields are required and cannot be empty",
      });
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {  // Validates that the email matches a standard email format.
      return res.status(400).json({  
        error: "Invalid email format",
      });
    }

    // Password strength validation
    if (password.length < 8) {  // Validates that the password is at least 8 characters long.
      return res.status(400).json({  
        error: "Password must be at least 8 characters long",
      });
    }

    // Check if email already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {  // Checks if the email is already registered in the database.
      return res.status(400).json({  
        error: "Email is already registered",
      });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 12); // Hashes the password using bcrypt with 12 rounds of salt.

    // Create and save new user
    const newUser = new User({ // Creates a new User instance with the provided username, hashed password, and email.
     name: name.trim(),
      password: hashedPassword,
      email: email.toLowerCase().trim(),
    });
    await newUser.save(); // Saves the new user to the database.

    // Respond to client 
    res.status(201).json({ // Sends a 201 Created response with a success message and the new user's ID, username, and email.
      message: "Signup successful",
      user: { 
        id: newUser._id,
        name: newUser.name, 
        email: newUser.email,
      },
    });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({
      error: "An error occurred during signup",
    });
  }
};

//SignIn

export const signin = async (req, res) => {
  try {
    // Destructure email and password from the request body
    const { email, password } = req.body;

    // Validate that both email and password are provided and not just whitespace
    if (!email?.trim() || !password?.trim()) {
      return res.status(400).json({
        error: "All fields are required and cannot be empty",
      });
    }

    // Define regex pattern for email validation  
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    // Test if the provided email matches the required format
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        error: "Invalid email format",
      });
    }

    // Search database for user with matching email (converted to lowercase)
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    // If no user is found, return error
    if (!existingUser) {
      return res.status(400).json({
        error: "User not found",
      });
    }

    // Compare provided password with hashed password stored in database
    const isPasswordCorrect = await bcrypt.compare(password, existingUser.password);
    // If passwords don't match, return error
    if (!isPasswordCorrect) {
      return res.status(400).json({ 
        error: "Invalid password",
      });
    } 

    // If all validations pass, send success response with user data
    res.status(200).json({
      message: "Signin successful",
      user: {
        id: existingUser._id,      // Include user's MongoDB ID
        name: existingUser.name,    // Include user's name
        email: existingUser.email,  // Include user's email
      },
    }); 
  } catch (error) {
    // Log any errors that occur during the signin process
    console.error("Signin error:", error);
    // Send generic error response to client
    res.status(500).json({
      error: "An error occurred during signin",
    });
  }
};



