import React, { useState, useEffect, useRef } from 'react';
import { motion, useSpring, useTransform, AnimatePresence } from 'framer-motion';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import LiquidGlassButton from '../LiquidGlassButton';

interface LivingBulbFormProps {
  onSubmit: (data: any) => void;  // Generic data object for both login and register
  isLoading?: boolean;
  errorMessage?: string;
  successMessage?: string;
  mode?: 'login' | 'register';
}

// Funny messages for errors
const EMAIL_ERROR_MESSAGES = [
  "Hmm... 🤔 Is that really an email?\nMaybe try: yourname@example.com?",
  "Wait... 😅 Where's the @ symbol?\nExample: cool.person@mail.com",
  "Oops! 🙈 That doesn't look right!\nTry: awesome@domain.com",
  "Is that a new email format? 🧐\nI only know: user@website.com",
  "Did you forget the @ symbol? 📧\nLike: smart.bulb@lights.com"
];

const PASSWORD_MISSING_MESSAGES = [
  "Hold on! 🖐️ You forgot the password!\nI need both email AND password!",
  "Whoa there! 😅 Password field is empty!\nDon't leave me hanging!",
  "Hey! 👋 Where's the password?\nYou can't login with just an email!",
  "Oops! 🙈 Password is missing!\nDid you forget it already?",
  "Wait wait wait! 🛑 No password?\nFill the whole form, please!",
  "Stop! ✋ Password field is empty!\nI promise I won't peek! 😇"
];

const EMPTY_FORM_MESSAGES = [
  "Umm... 🤔 Both fields are empty!\nDid you forget something?",
  "Hello? 👋 The form is blank!\nPlease fill in your details!",
  "Hey! 😄 You need to type something!\nEmail AND password, please!",
  "Oops! 🙈 Empty form!\nI can't read minds... yet!",
  "Wait! ✋ Nothing here!\nFill in your email and password!",
  "Whoa! 😅 Blank form!\nI need info to let you in!"
];

const ACCOUNT_NOT_FOUND_MESSAGES = [
  "Hmm... 🤔 I don't know you!\nAre you sure you have an account?",
  "Who are you? 👀 Account not found!\nMaybe you need to register first?",
  "Sorry! 😅 I've never seen you before!\nDid you create an account?",
  "Account not found! 🔍\nAre you new here? Try signing up!",
  "Oops! 🙈 Can't find your account!\nDouble-check your email?",
  "Unknown user! 🤷 No account found!\nMaybe time to register?"
];

const WRONG_PASSWORD_BACKEND_MESSAGES = [
  "Nope! 🙅 That's not the right password!\nTry again?",
  "Wrong password! 😬\nDid you mix it up with another account?",
  "Not quite! 🤔 Password doesn't match!\nThink harder!",
  "Access denied! 🚫 Wrong password!\nMaybe use 'Forgot Password'?",
  "Oops! 😅 Password is incorrect!\nCaps lock on?",
  "Nah! 🙃 That's not your password!\nOne more try?"
];

// Registration-specific messages
const PASSWORD_MISMATCH_MESSAGES = [
  "Oops! 🤔 Passwords don't match!\nDouble-check your typing!",
  "Wait! 😅 Those passwords are different!\nTry again carefully!",
  "Hmm... 🧐 Passwords must match!\nCopy-paste if you need to!",
  "Not matching! 🙈 Type carefully!\nTake your time!",
  "Different passwords! 😬\nMake sure they're identical!"
];

const WEAK_PASSWORD_MESSAGES = [
  "Too weak! 💪 Add more characters!\nMake it 6+ characters!",
  "Weak password! 🔒 Make it stronger!\nAdd numbers & symbols!",
  "Too short! 😅 Passwords need 6+ chars!\nMake it longer!",
  "Weak! 🛡️ Add more security!\nUse mix of letters & numbers!",
  "Not strong enough! 🔐\nMake it 6+ characters!"
];

const INVALID_NAME_MESSAGES = [
  "Names only! 📝 No numbers please!\nUse letters only!",
  "Hey! 🙈 Names don't have numbers!\nLetters only please!",
  "Oops! 🤔 That's not a valid name!\nRemove numbers & symbols!",
  "Wait! 😅 Numbers in your name?\nJust use letters!",
  "Invalid! ❌ Names are letters only!\nNo numbers or symbols!"
];

const INVALID_PASSWORD_FORMAT_MESSAGES = [
  "Stronger! 💪 Add uppercase & numbers!\nMake it super secure!",
  "Mix it up! 🔐 Use A-Z, a-z & 0-9!\nBe creative!",
  "Weak format! 🛡️ Add variety!\nUppercase, lowercase & numbers!",
  "Better security! 🔒 Mix letters & numbers!\nAdd uppercase too!",
  "Too simple! 😅 Use uppercase, lowercase\n& numbers together!"
];

const EMAIL_EXISTS_MESSAGES = [
  "Hey! 👋 This email is already registered!\nTry logging in instead?",
  "Oops! 😅 Email already exists!\nMaybe you already have an account?",
  "Wait! 🤔 That email is taken!\nDid you forget you signed up?",
  "Already registered! ✅\nTry the 'Sign In' page!",
  "Email exists! 📧 You're already a member!\nJust login!"
];

const MISSING_FIELDS_MESSAGES = [
  "Hold on! 🖐️ Fill all fields please!\nEvery detail counts!",
  "Wait! 😅 Some fields are empty!\nComplete the form!",
  "Oops! 🙈 Missing information!\nFill everything in!",
  "Hey! 👋 Don't skip fields!\nI need all your info!",
  "Stop! ✋ Form incomplete!\nFill all the blanks please!"
];

const USERNAME_TAKEN_MESSAGES = [
  "Oops! 😅 That username is taken!\nTry something unique!",
  "Sorry! 🤔 Username already exists!\nPick another one!",
  "Nope! 🙈 Someone has that username!\nBe creative!",
  "Taken! 🚫 Try a different username!\nAdd numbers maybe?",
  "Username exists! 😬 Try another!\nMake it unique!"
];

const INVALID_USERNAME_MESSAGES = [
  "Username issue! 😅 Use 3+ characters!\nLetters, numbers, _ and - only!",
  "Oops! 🤔 Username too short!\nNeed at least 3 characters!",
  "Invalid username! ❌ Use letters,\nnumbers, underscores & hyphens only!",
  "Username rules! 📝 Min 3 chars,\nletters/numbers/_ /- allowed!",
  "Not valid! 🙈 Username needs 3+ chars!\nNo special symbols except _ and -!"
];

const INVALID_PHONE_MESSAGES = [
  "Phone format! 📱 Use numbers only!\nExample: 1234567890",
  "Oops! 😅 Invalid phone number!\nOnly digits please!",
  "Phone issue! 📞 Numbers only!\nRemove spaces & symbols!",
  "Invalid! ❌ Phone needs digits!\nExample: 9876543210",
  "Not valid! 🤔 Use numbers only!\n10 digits work best!"
];

const LivingBulbForm: React.FC<LivingBulbFormProps> = ({
  onSubmit,
  isLoading = false,
  errorMessage = '',
  successMessage = '',
  mode = 'login',
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [isHoveringSubmit, setIsHoveringSubmit] = useState(false);
  const [emailError, setEmailError] = useState(false);
  const [thoughtBubbleMessage, setThoughtBubbleMessage] = useState<string>('');
  
  // Registration fields
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [username, setUsername] = useState('');
  const [phone, setPhone] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Cursor tracking
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });
  const bulbRef = useRef<HTMLDivElement>(null);
  const clearMessageTimerRef = useRef<NodeJS.Timeout | null>(null);
  const passwordInputRef = useRef<HTMLInputElement>(null);
  
  // Smooth spring animations for cursor following
  const cursorX = useSpring(0, { stiffness: 150, damping: 20 });
  const cursorY = useSpring(0, { stiffness: 150, damping: 20 });
  
  // Bulb tilt based on cursor
  const rotateY = useTransform(cursorX, [-1, 1], [-8, 8]);
  const rotateX = useTransform(cursorY, [-1, 1], [5, -5]);

  // Track cursor movement
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (bulbRef.current) {
        const rect = bulbRef.current.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        
        const normalizedX = (e.clientX - centerX) / (rect.width / 2);
        const normalizedY = (e.clientY - centerY) / (rect.height / 2);
        
        setCursorPos({ x: e.clientX, y: e.clientY });
        cursorX.set(Math.max(-1, Math.min(1, normalizedX)));
        cursorY.set(Math.max(-1, Math.min(1, normalizedY)));
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [cursorX, cursorY]);

  // Real-time email validation as user types
  useEffect(() => {
    // Clear any existing clear timer
    if (clearMessageTimerRef.current) {
      clearTimeout(clearMessageTimerRef.current);
      clearMessageTimerRef.current = null;
    }
    
    // Wait 1 second after user stops typing
    const timer = setTimeout(() => {
      if (email.length > 3) { // At least 4 characters typed
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const isEmailInvalid = !emailRegex.test(email);
        
        if (isEmailInvalid) {
          setEmailError(true);
          const randomMessage = EMAIL_ERROR_MESSAGES[Math.floor(Math.random() * EMAIL_ERROR_MESSAGES.length)];
          setThoughtBubbleMessage(randomMessage);
          
          // Auto-clear after 8 seconds
          clearMessageTimerRef.current = setTimeout(() => {
            setThoughtBubbleMessage('');
            setEmailError(false);
          }, 8000);
        } else {
          setThoughtBubbleMessage('');
          setEmailError(false);
        }
      } else if (email.length <= 3) {
        setThoughtBubbleMessage('');
        setEmailError(false);
      }
    }, 1000); // Show after 1 second of no typing
    
    return () => {
      clearTimeout(timer);
      if (clearMessageTimerRef.current) {
        clearTimeout(clearMessageTimerRef.current);
      }
    };
  }, [email]);

  // Real-time name validation - Only letters allowed
  useEffect(() => {
    if (mode === 'register' && (firstName || lastName)) {
      const timer = setTimeout(() => {
        const nameRegex = /^[a-zA-Z\s'-]+$/; // Only letters, spaces, hyphens, apostrophes
        
        if (firstName && firstName.length > 0 && !nameRegex.test(firstName)) {
          const randomMessage = INVALID_NAME_MESSAGES[Math.floor(Math.random() * INVALID_NAME_MESSAGES.length)];
          setThoughtBubbleMessage(randomMessage);
        } else if (lastName && lastName.length > 0 && !nameRegex.test(lastName)) {
          const randomMessage = INVALID_NAME_MESSAGES[Math.floor(Math.random() * INVALID_NAME_MESSAGES.length)];
          setThoughtBubbleMessage(randomMessage);
        } else {
          // Clear message if names are valid
          if (thoughtBubbleMessage && INVALID_NAME_MESSAGES.some(msg => msg === thoughtBubbleMessage)) {
            setThoughtBubbleMessage('');
          }
        }
      }, 800);
      
      return () => clearTimeout(timer);
    }
  }, [firstName, lastName, mode]);

  // Real-time username validation
  useEffect(() => {
    if (mode === 'register' && username && username.length > 0) {
      const timer = setTimeout(() => {
        // Username: 3+ characters, letters, numbers, underscore, hyphen only
        const usernameRegex = /^[a-zA-Z0-9_-]{3,}$/;
        
        if (!usernameRegex.test(username)) {
          const randomMessage = INVALID_USERNAME_MESSAGES[Math.floor(Math.random() * INVALID_USERNAME_MESSAGES.length)];
          setThoughtBubbleMessage(randomMessage);
        } else {
          // Clear message if username is valid
          if (thoughtBubbleMessage && INVALID_USERNAME_MESSAGES.some(msg => msg === thoughtBubbleMessage)) {
            setThoughtBubbleMessage('');
          }
        }
      }, 800);
      
      return () => clearTimeout(timer);
    }
  }, [username, mode]);

  // Real-time phone validation
  useEffect(() => {
    if (mode === 'register' && phone && phone.length > 0) {
      const timer = setTimeout(() => {
        // Phone: digits only, 10-15 characters
        const phoneRegex = /^[0-9]{10,15}$/;
        
        if (!phoneRegex.test(phone)) {
          const randomMessage = INVALID_PHONE_MESSAGES[Math.floor(Math.random() * INVALID_PHONE_MESSAGES.length)];
          setThoughtBubbleMessage(randomMessage);
        } else {
          // Clear message if phone is valid
          if (thoughtBubbleMessage && INVALID_PHONE_MESSAGES.some(msg => msg === thoughtBubbleMessage)) {
            setThoughtBubbleMessage('');
          }
        }
      }, 800);
      
      return () => clearTimeout(timer);
    }
  }, [phone, mode]);

  // Real-time password validation - Check strength and format
  useEffect(() => {
    if (mode === 'register' && password && password.length > 0) {
      const timer = setTimeout(() => {
        // Check password strength
        if (password.length < 6) {
          const randomMessage = WEAK_PASSWORD_MESSAGES[Math.floor(Math.random() * WEAK_PASSWORD_MESSAGES.length)];
          setThoughtBubbleMessage(randomMessage);
          return;
        }
        
        // Check password format - should have uppercase, lowercase, and numbers
        const hasUppercase = /[A-Z]/.test(password);
        const hasLowercase = /[a-z]/.test(password);
        const hasNumber = /[0-9]/.test(password);
        
        if (!hasUppercase || !hasLowercase || !hasNumber) {
          const randomMessage = INVALID_PASSWORD_FORMAT_MESSAGES[Math.floor(Math.random() * INVALID_PASSWORD_FORMAT_MESSAGES.length)];
          setThoughtBubbleMessage(randomMessage);
          return;
        }
        
        // Password is strong and valid format
        setThoughtBubbleMessage('');
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [password, mode]);

  // Real-time password match validation for registration
  useEffect(() => {
    if (mode === 'register' && password && confirmPassword) {
      const timer = setTimeout(() => {
        if (password !== confirmPassword) {
          const randomMessage = PASSWORD_MISMATCH_MESSAGES[Math.floor(Math.random() * PASSWORD_MISMATCH_MESSAGES.length)];
          setThoughtBubbleMessage(randomMessage);
        } else {
          setThoughtBubbleMessage('');
        }
      }, 500); // Check after 500ms of no typing
      
      return () => clearTimeout(timer);
    }
  }, [password, confirmPassword, mode]);

  // Detect submission errors and show funny messages
  useEffect(() => {
    if (errorMessage && errorMessage.trim()) {
      const errorLower = errorMessage.toLowerCase().trim();
      let randomMessage = '';
      
      // Registration-specific errors
      if (mode === 'register') {
        // Email already exists
        if (errorLower.includes('email already exists') || 
            errorLower.includes('email already registered') || 
            errorLower.includes('email is already in use') ||
            errorLower.includes('user already exists') ||
            errorLower.includes('already registered')) {
          randomMessage = EMAIL_EXISTS_MESSAGES[Math.floor(Math.random() * EMAIL_EXISTS_MESSAGES.length)];
        }
        // Username already taken
        else if (errorLower.includes('username already exists') ||
                 errorLower.includes('username is taken') ||
                 errorLower.includes('username already taken')) {
          randomMessage = USERNAME_TAKEN_MESSAGES[Math.floor(Math.random() * USERNAME_TAKEN_MESSAGES.length)];
        }
        // Missing required fields
        else if (errorLower.includes('required') ||
                 errorLower.includes('missing') ||
                 errorLower.includes('field')) {
          randomMessage = MISSING_FIELDS_MESSAGES[Math.floor(Math.random() * MISSING_FIELDS_MESSAGES.length)];
        }
        // Password too weak
        else if (errorLower.includes('weak') ||
                 errorLower.includes('short') ||
                 errorLower.includes('character')) {
          randomMessage = WEAK_PASSWORD_MESSAGES[Math.floor(Math.random() * WEAK_PASSWORD_MESSAGES.length)];
        }
        // Generic registration error
        else {
          randomMessage = MISSING_FIELDS_MESSAGES[Math.floor(Math.random() * MISSING_FIELDS_MESSAGES.length)];
        }
      }
      // Login-specific errors
      else {
        // Account not found (login error)
        if (errorLower.includes('user not found') || 
            errorLower.includes('account not found') || 
            errorLower.includes('user does not exist') ||
            errorLower.includes('no user found') ||
            errorLower.includes('not found')) {
          randomMessage = ACCOUNT_NOT_FOUND_MESSAGES[Math.floor(Math.random() * ACCOUNT_NOT_FOUND_MESSAGES.length)];
        }
        // Check if wrong password or credentials
        else if (errorLower.includes('incorrect') || 
                 errorLower.includes('wrong') ||
                 errorLower.includes('invalid') ||
                 errorLower.includes('credentials') ||
                 errorLower.includes('password') ||
                 errorLower.includes('failed') ||
                 errorLower.includes('authentication') ||
                 errorLower.includes('unauthorized') ||
                 errorLower.includes('error')) {
          randomMessage = WRONG_PASSWORD_BACKEND_MESSAGES[Math.floor(Math.random() * WRONG_PASSWORD_BACKEND_MESSAGES.length)];
        }
        // Generic login error - show wrong credentials message
        else {
          randomMessage = WRONG_PASSWORD_BACKEND_MESSAGES[Math.floor(Math.random() * WRONG_PASSWORD_BACKEND_MESSAGES.length)];
        }
      }
      
      setThoughtBubbleMessage(randomMessage);

      // Clear thought bubble after 8 seconds
      const timer = setTimeout(() => {
        setThoughtBubbleMessage('');
      }, 8000);
      
      return () => clearTimeout(timer);
    } else {
      if (!emailError) {
        setThoughtBubbleMessage('');
      }
    }
  }, [errorMessage, emailError, mode]);

  // Calculate eye position based on cursor - LOGICAL eye behavior
  // Both eyes close when typing password (hidden)
  const shouldCloseBothEyes = 
    (focusedField === 'password' && !showPassword) || 
    (focusedField === 'confirmPassword' && !showConfirmPassword);
  
  // One eye peeks when password is visible while focused
  const shouldPeekOneEye = 
    (focusedField === 'password' && showPassword) || 
    (focusedField === 'confirmPassword' && showConfirmPassword);
  
  const getEyePosition = (eyeX: number, eyeY: number) => {
    if (bulbRef.current && !shouldCloseBothEyes) {
      const rect = bulbRef.current.getBoundingClientRect();
      const eyeAbsX = rect.left + eyeX;
      const eyeAbsY = rect.top + eyeY;
      
      const dx = cursorPos.x - eyeAbsX;
      const dy = cursorPos.y - eyeAbsY;
      const angle = Math.atan2(dy, dx);
      const distance = Math.min(5, Math.sqrt(dx * dx + dy * dy) / 40);
      
      return {
        x: Math.cos(angle) * distance,
        y: Math.sin(angle) * distance,
      };
    }
    return { x: 0, y: 0 };
  };

  const leftEyePos = getEyePosition(280, 140);
  const rightEyePos = getEyePosition(360, 140);

  // Determine bulb state
  const getBulbState = () => {
    if (successMessage) return 'success';
    if (thoughtBubbleMessage) return 'thinking';
    if (errorMessage) return 'error';
    if (isLoading) return 'loading';
    if (shouldCloseBothEyes) return 'covering';
    if (shouldPeekOneEye) return 'peeking';
    if (isHoveringSubmit) return 'excited';
    if (focusedField) return 'focused';
    return 'idle';
  };

  const bulbState = getBulbState();

  // Calculate completion level (0-100) for progressive glow
  const getCompletionLevel = () => {
    if (mode === 'register') {
      // Registration has 6 required fields + 1 optional (phone)
      const fields = [firstName, lastName, email, username, password, confirmPassword];
      const filledCount = fields.filter(field => field && field.trim().length > 0).length;
      return (filledCount / 6) * 100; // 0% to 100%
    } else {
      // Login has 2 fields
      const fields = [email, password];
      const filledCount = fields.filter(field => field && field.trim().length > 0).length;
      return (filledCount / 2) * 100; // 0% to 100%
    }
  };

  const completionLevel = getCompletionLevel();
  
  // Calculate glow intensity based on completion (20% base, up to 100%)
  const glowIntensity = 0.2 + (completionLevel / 100) * 0.8;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation(); // Stop event from bubbling up
    
    // Registration mode validations
    if (mode === 'register') {
      // Check if required fields are empty
      if (!firstName || !lastName || !email || !username || !password || !confirmPassword) {
        const randomMessage = MISSING_FIELDS_MESSAGES[Math.floor(Math.random() * MISSING_FIELDS_MESSAGES.length)];
        setThoughtBubbleMessage(randomMessage);
        
        setTimeout(() => {
          setThoughtBubbleMessage('');
        }, 6000);
        
        return false;
      }
      
      // Check name format - Only letters allowed
      const nameRegex = /^[a-zA-Z\s'-]+$/;
      if (!nameRegex.test(firstName) || !nameRegex.test(lastName)) {
        const randomMessage = INVALID_NAME_MESSAGES[Math.floor(Math.random() * INVALID_NAME_MESSAGES.length)];
        setThoughtBubbleMessage(randomMessage);
        
        setTimeout(() => {
          setThoughtBubbleMessage('');
        }, 6000);
        
        return false;
      }
      
      // Check username format - 3+ characters, alphanumeric, underscore, hyphen
      const usernameRegex = /^[a-zA-Z0-9_-]{3,}$/;
      if (!usernameRegex.test(username)) {
        const randomMessage = INVALID_USERNAME_MESSAGES[Math.floor(Math.random() * INVALID_USERNAME_MESSAGES.length)];
        setThoughtBubbleMessage(randomMessage);
        
        setTimeout(() => {
          setThoughtBubbleMessage('');
        }, 6000);
        
        return false;
      }
      
      // Check email format for registration
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        const randomMessage = EMAIL_ERROR_MESSAGES[Math.floor(Math.random() * EMAIL_ERROR_MESSAGES.length)];
        setThoughtBubbleMessage(randomMessage);
        
        setTimeout(() => {
          setThoughtBubbleMessage('');
        }, 6000);
        
        return false;
      }
      
      // Check phone format if provided - digits only, 10-15 characters
      if (phone && phone.length > 0) {
        const phoneRegex = /^[0-9]{10,15}$/;
        if (!phoneRegex.test(phone)) {
          const randomMessage = INVALID_PHONE_MESSAGES[Math.floor(Math.random() * INVALID_PHONE_MESSAGES.length)];
          setThoughtBubbleMessage(randomMessage);
          
          setTimeout(() => {
            setThoughtBubbleMessage('');
          }, 6000);
          
          return false;
        }
      }
      
      // Check password strength
      if (password.length < 6) {
        const randomMessage = WEAK_PASSWORD_MESSAGES[Math.floor(Math.random() * WEAK_PASSWORD_MESSAGES.length)];
        setThoughtBubbleMessage(randomMessage);
        
        setTimeout(() => {
          setThoughtBubbleMessage('');
        }, 6000);
        
        return false;
      }
      
      // Check password format - Must have uppercase, lowercase, and numbers
      const hasUppercase = /[A-Z]/.test(password);
      const hasLowercase = /[a-z]/.test(password);
      const hasNumber = /[0-9]/.test(password);
      
      if (!hasUppercase || !hasLowercase || !hasNumber) {
        const randomMessage = INVALID_PASSWORD_FORMAT_MESSAGES[Math.floor(Math.random() * INVALID_PASSWORD_FORMAT_MESSAGES.length)];
        setThoughtBubbleMessage(randomMessage);
        
        setTimeout(() => {
          setThoughtBubbleMessage('');
        }, 6000);
        
        return false;
      }
      
      // Check if passwords match
      if (password !== confirmPassword) {
        const randomMessage = PASSWORD_MISMATCH_MESSAGES[Math.floor(Math.random() * PASSWORD_MISMATCH_MESSAGES.length)];
        setThoughtBubbleMessage(randomMessage);
        
        setTimeout(() => {
          setThoughtBubbleMessage('');
        }, 6000);
        
        return false;
      }
      
      // Call parent submit handler with registration data
      onSubmit({ firstName, lastName, email, username, phone, password, confirmPassword });
      return false;
    }
    
    // Login mode validations
    // Check if both fields are empty
    if (!email && !password) {
      const randomMessage = EMPTY_FORM_MESSAGES[Math.floor(Math.random() * EMPTY_FORM_MESSAGES.length)];
      setThoughtBubbleMessage(randomMessage);
      
      setTimeout(() => {
        setThoughtBubbleMessage('');
      }, 6000);
      
      return false; // Don't submit
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isEmailValid = emailRegex.test(email);
    
    // Check if email is invalid or missing
    if (!isEmailValid) {
      const randomMessage = EMAIL_ERROR_MESSAGES[Math.floor(Math.random() * EMAIL_ERROR_MESSAGES.length)];
      setThoughtBubbleMessage(randomMessage);
      
      setTimeout(() => {
        setThoughtBubbleMessage('');
      }, 6000);
      
      return false; // Don't submit
    }
    
    // Check if password is missing
    if (isEmailValid && !password) {
      const randomMessage = PASSWORD_MISSING_MESSAGES[Math.floor(Math.random() * PASSWORD_MISSING_MESSAGES.length)];
      setThoughtBubbleMessage(randomMessage);
      
      setTimeout(() => {
        setThoughtBubbleMessage('');
      }, 6000);
      
      return false; // Don't submit
    }
    
    // Call parent submit handler
    onSubmit({ email, password });
    return false; // Prevent any default form submission
  };

  return (
    <div className="relative w-full max-w-2xl mx-auto overflow-visible" ref={bulbRef}>
      <motion.div
        className="relative"
        style={{
          rotateY,
          rotateX,
          transformPerspective: 1200,
        }}
        animate={
          bulbState === 'error'
            ? { x: [-10, 10, -10, 10, 0], transition: { duration: 0.5 } }
            : bulbState === 'success'
            ? { scale: [1, 1.05, 1, 1.05, 1], transition: { duration: 0.6, repeat: 2 } }
            : {}
        }
      >
        {/* BACKGROUND LAYER */}
        <svg
          width="640"
          height="550"
          viewBox="-100 -100 840 750"
          className="w-full h-auto"
          xmlns="http://www.w3.org/2000/svg"
          style={{ overflow: 'visible' }}
        >
          <defs>
            {/* Realistic glass gradient with depth */}
            <radialGradient id="bulbGlass" cx="35%" cy="25%">
              <stop offset="0%" stopColor="#FFFFFF" stopOpacity="1" />
              <stop offset="20%" stopColor="#F8FAFC" stopOpacity="0.95" />
              <stop offset="50%" stopColor="#E8F0FE" stopOpacity="0.85" />
              <stop offset="80%" stopColor="#D6E4FF" stopOpacity="0.75" />
              <stop offset="100%" stopColor="#C5D9F2" stopOpacity="0.65" />
            </radialGradient>

            {/* Inner glass shadow for depth */}
            <radialGradient id="glassInnerShadow" cx="50%" cy="70%">
              <stop offset="0%" stopColor="#000000" stopOpacity="0" />
              <stop offset="100%" stopColor="#1E293B" stopOpacity="0.12" />
            </radialGradient>

            {/* Glow gradient - intensity based on completion */}
            <radialGradient id="bulbGlow">
              <stop
                offset="0%"
                stopColor={
                  bulbState === 'success'
                    ? '#4ADE80'
                    : bulbState === 'error'
                    ? '#EF4444'
                    : '#FCD34D'
                }
                stopOpacity={Math.min(0.8, glowIntensity * 0.7)}
              />
              <stop
                offset="100%"
                stopColor={
                  bulbState === 'success'
                    ? '#22C55E'
                    : bulbState === 'error'
                    ? '#DC2626'
                    : '#F59E0B'
                }
                stopOpacity="0"
              />
            </radialGradient>
            
            {/* Inner filament glow */}
            <radialGradient id="filamentGlow" cx="50%" cy="40%">
              <stop offset="0%" stopColor="#FFF7ED" stopOpacity={glowIntensity * 0.9} />
              <stop offset="30%" stopColor="#FBBF24" stopOpacity={glowIntensity * 0.6} />
              <stop offset="70%" stopColor="#F59E0B" stopOpacity={glowIntensity * 0.3} />
              <stop offset="100%" stopColor="#D97706" stopOpacity="0" />
            </radialGradient>

            {/* Metal base gradient - chrome effect */}
            <linearGradient id="baseGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#71717A" />
              <stop offset="15%" stopColor="#A1A1AA" />
              <stop offset="30%" stopColor="#D4D4D8" />
              <stop offset="50%" stopColor="#FAFAFA" />
              <stop offset="70%" stopColor="#D4D4D8" />
              <stop offset="85%" stopColor="#A1A1AA" />
              <stop offset="100%" stopColor="#71717A" />
            </linearGradient>

            {/* Shadow filters */}
            <filter id="dropShadow">
              <feGaussianBlur in="SourceAlpha" stdDeviation="8" />
              <feOffset dx="0" dy="8" result="offsetblur" />
              <feComponentTransfer>
                <feFuncA type="linear" slope="0.3" />
              </feComponentTransfer>
              <feMerge>
                <feMergeNode />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Ground shadow */}
          <ellipse cx="320" cy="530" rx="140" ry="18" fill="#000000" opacity="0.2" />

          {/* Multi-layer outer glow - Perfectly round */}
          {/* Layer 1: Largest, softest glow */}
          <motion.circle
            cx="320"
            cy="200"
            r="250"
            fill="url(#bulbGlow)"
            animate={
              bulbState === 'success'
                ? { opacity: [0.3, 0.5, 0.3], scale: [1, 1.1, 1] }
                : { 
                    opacity: [glowIntensity * 0.15, glowIntensity * 0.3, glowIntensity * 0.15],
                    scale: [1, 1.05, 1]
                  }
            }
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
            style={{ filter: 'blur(80px)' }}
          />
          
          {/* Layer 2: Medium glow */}
          <motion.circle
            cx="320"
            cy="210"
            r="180"
            fill="url(#bulbGlow)"
            animate={
              bulbState === 'loading' || bulbState === 'focused'
                ? { 
                    opacity: [glowIntensity * 0.4, glowIntensity * 0.8, glowIntensity * 0.4], 
                    scale: [1, 1.05 + (completionLevel / 200), 1] 
                  }
                : bulbState === 'success'
                ? { opacity: [0.6, 0.9, 0.6], scale: [1, 1.15, 1] }
                : bulbState === 'error'
                ? { opacity: [0.2, 0.4, 0.2], scale: [1, 1.05, 1] }
                : { 
                    opacity: [glowIntensity * 0.3, glowIntensity * 0.6, glowIntensity * 0.3],
                    scale: [1, 1 + (completionLevel / 250), 1]
                  }
            }
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            style={{ filter: 'blur(60px)' }}
          />
          
          {/* Layer 3: Innermost, brightest glow */}
          <motion.circle
            cx="320"
            cy="215"
            r="140"
            fill="url(#bulbGlow)"
            animate={{ 
              opacity: [glowIntensity * 0.5, glowIntensity * 0.9, glowIntensity * 0.5],
              scale: [1, 1.08, 1]
            }}
            transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
            style={{ filter: 'blur(40px)' }}
          />

          {/* Thinking dots only in SVG */}
          <AnimatePresence>
            {thoughtBubbleMessage && (
              <g id="thinkingDots">
                <motion.circle
                  cx="420"
                  cy="140"
                  r="8"
                  fill="#FFFFFF"
                  stroke="#64748B"
                  strokeWidth="2.5"
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  transition={{ delay: 0.1 }}
                />
                <motion.circle
                  cx="450"
                  cy="115"
                  r="14"
                  fill="#FFFFFF"
                  stroke="#64748B"
                  strokeWidth="2.5"
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  transition={{ delay: 0.2 }}
                />
              </g>
            )}
          </AnimatePresence>

          {/* Main bulb body */}
          <g filter="url(#dropShadow)">
            <path
              d="M 320 60 
                 C 230 60, 160 130, 160 220
                 C 160 290, 195 345, 220 380
                 C 232 398, 245 415, 255 425
                 L 255 450
                 L 385 450
                 L 385 425
                 C 395 415, 408 398, 420 380
                 C 445 345, 480 290, 480 220
                 C 480 130, 410 60, 320 60 Z"
              fill="url(#bulbGlass)"
              stroke="#94A3B8"
              strokeWidth="1.5"
              opacity="0.98"
            />
            
            <path
              d="M 320 60 
                 C 230 60, 160 130, 160 220
                 C 160 290, 195 345, 220 380
                 C 232 398, 245 415, 255 425
                 L 255 450
                 L 385 450
                 L 385 425
                 C 395 415, 408 398, 420 380
                 C 445 345, 480 290, 480 220
                 C 480 130, 410 60, 320 60 Z"
              fill="url(#glassInnerShadow)"
              opacity="0.6"
            />
          </g>

          {/* Glass highlights */}
          <ellipse cx="250" cy="130" rx="70" ry="100" fill="#FFFFFF" opacity="0.6" />
          <ellipse cx="240" cy="120" rx="40" ry="60" fill="#FFFFFF" opacity="0.8" />
          <path
            d="M 200 100 Q 220 180 210 250"
            stroke="#FFFFFF"
            strokeWidth="3"
            fill="none"
            opacity="0.5"
            strokeLinecap="round"
          />

          {/* Progressive inner glow - level up effect - Natural round glow */}
          <motion.ellipse
            cx="320"
            cy="200"
            rx="140"
            ry="160"
            fill={bulbState === 'success' ? '#4ADE80' : bulbState === 'error' ? '#EF4444' : '#FCD34D'}
            animate={{
              opacity: [glowIntensity * 0.12, glowIntensity * 0.25, glowIntensity * 0.12]
            }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            style={{ filter: 'blur(30px)' }}
          />

          {/* Filament core - gets brighter as fields fill */}
          <motion.ellipse
            cx="320"
            cy="180"
            rx="70"
            ry="90"
            fill="url(#filamentGlow)"
            animate={{
              opacity: [0.3, 0.7, 0.3],
              scale: [1, 1.08, 1]
            }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
            style={{ filter: 'blur(20px)' }}
          />

          {/* Metal base */}
          <g id="base">
            <ellipse cx="320" cy="450" rx="65" ry="8" fill="#D4D4D8" />
            <ellipse cx="320" cy="448" rx="65" ry="4" fill="#FAFAFA" opacity="0.8" />
            <rect x="255" y="450" width="130" height="70" rx="4" fill="url(#baseGradient)" />
            <g opacity="0.6">
              <rect x="258" y="460" width="124" height="4" rx="2" fill="#52525B" />
              <rect x="258" y="460" width="124" height="1" rx="0.5" fill="#FAFAFA" />
              <rect x="258" y="472" width="124" height="4" rx="2" fill="#52525B" />
              <rect x="258" y="472" width="124" height="1" rx="0.5" fill="#FAFAFA" />
              <rect x="258" y="484" width="124" height="4" rx="2" fill="#52525B" />
              <rect x="258" y="484" width="124" height="1" rx="0.5" fill="#FAFAFA" />
              <rect x="258" y="496" width="124" height="4" rx="2" fill="#52525B" />
              <rect x="258" y="496" width="124" height="1" rx="0.5" fill="#FAFAFA" />
              <rect x="258" y="508" width="124" height="4" rx="2" fill="#52525B" />
              <rect x="258" y="508" width="124" height="1" rx="0.5" fill="#FAFAFA" />
            </g>
            <ellipse cx="320" cy="520" rx="60" ry="6" fill="#71717A" />
            <ellipse cx="320" cy="520" rx="45" ry="4" fill="#A1A1AA" />
            <circle cx="320" cy="520" r="12" fill="#52525B" />
            <circle cx="320" cy="520" r="8" fill="#71717A" />
          </g>

        </svg>

        {/* MIDDLE LAYER: Form fields */}
        <form 
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            return false;
          }}
          action="javascript:void(0);"
          method="post"
          noValidate
          className={`absolute ${mode === 'register' ? 'top-[220px]' : 'top-[180px]'} left-1/2 -translate-x-1/2 ${mode === 'register' ? 'w-[380px]' : 'w-[300px]'} ${mode === 'register' ? 'space-y-3' : 'space-y-5'} z-10`}
        >
          {/* Registration fields */}
          {mode === 'register' && (
            <>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  onFocus={() => setFocusedField('firstName')}
                  onBlur={() => setFocusedField(null)}
                  placeholder="First Name"
                  className="w-full px-3 py-2.5 bg-white/60 backdrop-blur-xl border-2 border-white/40 rounded-2xl 
                             focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-300 focus:bg-white/75
                             text-gray-900 placeholder-gray-500 shadow-xl transition-all"
                />
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  onFocus={() => setFocusedField('lastName')}
                  onBlur={() => setFocusedField(null)}
                  placeholder="Last Name"
                  className="w-full px-3 py-2.5 bg-white/60 backdrop-blur-xl border-2 border-white/40 rounded-2xl 
                             focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-300 focus:bg-white/75
                             text-gray-900 placeholder-gray-500 shadow-xl transition-all"
                />
              </div>
            </>
          )}

          <div>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onFocus={() => setFocusedField('email')}
              onBlur={() => setFocusedField(null)}
              onKeyDown={(e: React.KeyboardEvent) => {
                if (e.key === 'Enter' && mode === 'login') {
                  e.preventDefault();
                  const fakeEvent = { preventDefault: () => {}, stopPropagation: () => {} } as React.FormEvent;
                  handleSubmit(fakeEvent);
                }
              }}
              placeholder="Email"
              autoComplete="email"
              className={`w-full ${mode === 'register' ? 'px-3 py-2.5' : 'px-4 py-3.5'} bg-white/60 backdrop-blur-xl border-2 border-white/40 rounded-2xl 
                         focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-300 focus:bg-white/75
                         text-gray-900 placeholder-gray-500 shadow-xl transition-all`}
            />
          </div>

          {/* Username and Phone for registration */}
          {mode === 'register' && (
            <>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                onFocus={() => setFocusedField('username')}
                onBlur={() => setFocusedField(null)}
                placeholder="Username"
                className="w-full px-3 py-2.5 bg-white/60 backdrop-blur-xl border-2 border-white/40 rounded-2xl 
                           focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-300 focus:bg-white/75
                           text-gray-900 placeholder-gray-500 shadow-xl transition-all"
              />
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                onFocus={() => setFocusedField('phone')}
                onBlur={() => setFocusedField(null)}
                placeholder="Phone (Optional)"
                className="w-full px-3 py-2.5 bg-white/60 backdrop-blur-xl border-2 border-white/40 rounded-2xl 
                           focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-300 focus:bg-white/75
                           text-gray-900 placeholder-gray-500 shadow-xl transition-all"
              />
            </>
          )}

          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onFocus={() => setFocusedField('password')}
              onBlur={() => setFocusedField(null)}
              onKeyDown={(e: React.KeyboardEvent) => {
                if (e.key === 'Enter' && mode === 'login') {
                  e.preventDefault();
                  const fakeEvent = { preventDefault: () => {}, stopPropagation: () => {} } as React.FormEvent;
                  handleSubmit(fakeEvent);
                }
              }}
              placeholder="Password"
              autoComplete="current-password"
              className={`w-full ${mode === 'register' ? 'px-3 py-2.5 pr-10' : 'px-4 py-3.5 pr-12'} bg-white/60 backdrop-blur-xl border-2 border-white/40 rounded-2xl 
                         focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-300 focus:bg-white/75
                         text-gray-900 placeholder-gray-500 shadow-xl transition-all`}
            />
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                setShowPassword(!showPassword);
                // Keep focus on password field
                const passwordInput = e.currentTarget.previousElementSibling as HTMLInputElement;
                if (passwordInput) {
                  setTimeout(() => passwordInput.focus(), 0);
                }
              }}
              onMouseDown={(e) => e.preventDefault()} // Prevent focus loss
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-800 z-20"
            >
              {showPassword ? (
                <EyeSlashIcon className="h-5 w-5" />
              ) : (
                <EyeIcon className="h-5 w-5" />
              )}
            </button>
          </div>

          {/* Confirm Password for registration */}
          {mode === 'register' && (
            <div className="relative">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                onFocus={() => setFocusedField('confirmPassword')}
                onBlur={() => setFocusedField(null)}
                placeholder="Confirm Password"
                className="w-full px-3 py-2.5 pr-10 bg-white/60 backdrop-blur-xl border-2 border-white/40 rounded-2xl 
                           focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-300 focus:bg-white/75
                           text-gray-900 placeholder-gray-500 shadow-xl transition-all"
              />
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  setShowConfirmPassword(!showConfirmPassword);
                  // Keep focus on confirm password field
                  const confirmInput = e.currentTarget.previousElementSibling as HTMLInputElement;
                  if (confirmInput) {
                    setTimeout(() => confirmInput.focus(), 0);
                  }
                }}
                onMouseDown={(e) => e.preventDefault()}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-800 z-20"
              >
                {showConfirmPassword ? (
                  <EyeSlashIcon className="h-5 w-5" />
                ) : (
                  <EyeIcon className="h-5 w-5" />
                )}
              </button>
            </div>
          )}

          {errorMessage && (
            <motion.p
              className="text-red-600 text-sm text-center font-medium bg-white/90 backdrop-blur-sm rounded-xl py-2 px-3 shadow-lg"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {errorMessage}
            </motion.p>
          )}
          {successMessage && (
            <motion.p
              className="text-green-600 text-sm text-center font-medium bg-white/90 backdrop-blur-sm rounded-xl py-2 px-3 shadow-lg"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {successMessage}
            </motion.p>
          )}

          <div
            onMouseEnter={() => setIsHoveringSubmit(true)}
            onMouseLeave={() => setIsHoveringSubmit(false)}
          >
            <LiquidGlassButton
              type="button"
              disabled={isLoading}
              variant="primary"
              size="lg"
              fullWidth
              onClick={() => {
                const fakeEvent = { preventDefault: () => {}, stopPropagation: () => {} } as React.FormEvent;
                handleSubmit(fakeEvent);
              }}
            >
              {isLoading ? 'Please wait...' : mode === 'login' ? 'Sign In' : 'Create Account'}
            </LiquidGlassButton>
          </div>
        </form>

        {/* FOREGROUND LAYER: Face */}
        <div className="absolute inset-0 pointer-events-none z-20">
          <svg
            width="640"
            height="550"
            viewBox="-100 -100 840 750"
            className="w-full h-auto"
            xmlns="http://www.w3.org/2000/svg"
            style={{ overflow: 'visible' }}
          >
            {/* Eyes */}
            <g id="eyes">
              {shouldCloseBothEyes ? (
                // Both eyes closed - shy
                <>
                  <motion.path
                    d="M 260 140 Q 280 135 300 140"
                    stroke="#2C3E50"
                    strokeWidth="5"
                    strokeLinecap="round"
                    fill="none"
                    initial={{ scaleX: 1 }}
                    animate={{ scaleX: [1, 0.2, 1] }}
                    transition={{ duration: 0.3 }}
                  />
                  <motion.path
                    d="M 340 140 Q 360 135 380 140"
                    stroke="#2C3E50"
                    strokeWidth="5"
                    strokeLinecap="round"
                    fill="none"
                    initial={{ scaleX: 1 }}
                    animate={{ scaleX: [1, 0.2, 1] }}
                    transition={{ duration: 0.3 }}
                  />
                </>
              ) : shouldPeekOneEye ? (
                // Peeking - left eye closed, right eye open
                <>
                  {/* Left eye - closed */}
                  <motion.path
                    d="M 260 140 Q 280 135 300 140"
                    stroke="#2C3E50"
                    strokeWidth="5"
                    strokeLinecap="round"
                    fill="none"
                    initial={{ scaleX: 1 }}
                    animate={{ scaleX: [1, 0.2, 1] }}
                    transition={{ duration: 0.3 }}
                  />
                  
                  {/* Right eye - open (peeking) */}
                  <g>
                    <ellipse cx="360" cy="140" rx="26" ry="32" fill="#FFFFFF" stroke="#64748B" strokeWidth="2.5" />
                    <motion.ellipse
                      cx={360 + rightEyePos.x}
                      cy={140 + rightEyePos.y}
                      rx="13"
                      ry="16"
                      fill="#1E293B"
                    />
                    <circle cx={364 + rightEyePos.x} cy={136 + rightEyePos.y} r="6" fill="#FFFFFF" />
                    <circle cx={362 + rightEyePos.x} cy={142 + rightEyePos.y} r="3" fill="#FFFFFF" opacity="0.6" />
                  </g>
                </>
              ) : (
                // Both eyes open - normal
                <>
                  <g>
                    <ellipse cx="280" cy="140" rx="26" ry="32" fill="#FFFFFF" stroke="#64748B" strokeWidth="2.5" />
                    <motion.ellipse
                      cx={280 + leftEyePos.x}
                      cy={140 + leftEyePos.y}
                      rx="13"
                      ry="16"
                      fill="#1E293B"
                      animate={
                        bulbState === 'idle'
                          ? { scaleY: [1, 0.1, 1] }
                          : {}
                      }
                      transition={{ duration: 0.15, repeat: Infinity, repeatDelay: 5 }}
                    />
                    <circle cx={284 + leftEyePos.x} cy={136 + leftEyePos.y} r="6" fill="#FFFFFF" />
                    <circle cx={282 + leftEyePos.x} cy={142 + leftEyePos.y} r="3" fill="#FFFFFF" opacity="0.6" />
                  </g>

                  <g>
                    <ellipse cx="360" cy="140" rx="26" ry="32" fill="#FFFFFF" stroke="#64748B" strokeWidth="2.5" />
                    <motion.ellipse
                      cx={360 + rightEyePos.x}
                      cy={140 + rightEyePos.y}
                      rx="13"
                      ry="16"
                      fill="#1E293B"
                      animate={
                        bulbState === 'idle'
                          ? { scaleY: [1, 0.1, 1] }
                          : {}
                      }
                      transition={{ duration: 0.15, repeat: Infinity, repeatDelay: 5, delay: 0.1 }}
                    />
                    <circle cx={364 + rightEyePos.x} cy={136 + rightEyePos.y} r="6" fill="#FFFFFF" />
                    <circle cx={362 + rightEyePos.x} cy={142 + rightEyePos.y} r="3" fill="#FFFFFF" opacity="0.6" />
                  </g>
                </>
              )}
            </g>

            {/* Mouth */}
            <motion.path
              d={
                bulbState === 'success'
                  ? 'M 280 400 Q 320 435 360 400'
                  : bulbState === 'thinking'
                  ? 'M 285 405 Q 310 410 335 405'
                  : bulbState === 'error'
                  ? 'M 280 415 Q 320 390 360 415'
                  : bulbState === 'excited' || isHoveringSubmit
                  ? 'M 280 400 Q 320 430 360 400'
                  : bulbState === 'covering'
                  ? 'M 290 410 Q 320 405 350 410'
                  : 'M 285 405 Q 320 420 355 405'
              }
              stroke="#1E293B"
              strokeWidth="5"
              fill="none"
              strokeLinecap="round"
              animate={
                bulbState === 'loading'
                  ? {
                      d: [
                        'M 285 405 Q 320 420 355 405',
                        'M 290 410 Q 320 405 350 410',
                        'M 285 405 Q 320 420 355 405',
                      ],
                    }
                  : bulbState === 'thinking'
                  ? {
                      d: [
                        'M 285 405 Q 310 410 335 405',
                        'M 290 408 Q 310 405 330 408',
                        'M 285 405 Q 310 410 335 405',
                      ],
                    }
                  : {}
              }
              transition={{ duration: 0.8, repeat: Infinity }}
            />

            {/* Blush when shy (closing eyes or peeking) */}
            {(shouldCloseBothEyes || shouldPeekOneEye) && (
              <>
                <motion.ellipse
                  cx="220"
                  cy="180"
                  rx="30"
                  ry="22"
                  fill="#FF6B9D"
                  opacity="0.5"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.3 }}
                />
                <motion.ellipse
                  cx="420"
                  cy="180"
                  rx="30"
                  ry="22"
                  fill="#FF6B9D"
                  opacity="0.5"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.3 }}
                />
              </>
            )}
          </svg>
        </div>

        {/* Thought Bubble Overlay - HTML div outside SVG */}
        <AnimatePresence>
          {thoughtBubbleMessage && (
            <motion.div
              className="absolute top-[60px] right-[-80px] w-[200px] z-30 pointer-events-none"
              initial={{ scale: 0, opacity: 0, x: -20 }}
              animate={{ scale: 1, opacity: 1, x: 0 }}
              exit={{ scale: 0, opacity: 0, x: 20 }}
              transition={{ type: 'spring', stiffness: 200, damping: 20 }}
            >
              <div className="relative bg-white border-[2.5px] border-gray-500 rounded-2xl p-4 shadow-xl">
                {/* Tail pointing to bulb */}
                <div className="absolute left-[-14px] top-[50px] w-0 h-0 border-t-[12px] border-t-transparent border-b-[12px] border-b-transparent border-r-[16px] border-r-white z-10" />
                <div className="absolute left-[-17px] top-[49px] w-0 h-0 border-t-[13px] border-t-transparent border-b-[13px] border-b-transparent border-r-[17px] border-r-gray-500" />
                
                {/* Message text */}
                <p className="text-gray-800 text-[11px] font-semibold leading-relaxed whitespace-pre-line">
                  {thoughtBubbleMessage}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default LivingBulbForm;
