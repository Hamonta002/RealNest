const fs = require("fs");
let content = fs.readFileSync("src/pages/Login.jsx", "utf8");

// 1. Fix port
content = content.replace("http://localhost:5000", "http://localhost:5050");

// 2. Add user to localStorage
content = content.replace(
  "localStorage.setItem('token', data.token)",
  "localStorage.setItem('token', data.token);\n      localStorage.setItem('user', JSON.stringify(data.user));"
);

// 3. Remove social buttons
const startStr = "{/*  Divider  */}";
const endStr = "{/*  Switch to Register  */}";
const startIndex = content.indexOf(startStr);
const endIndex = content.indexOf(endStr);

if (startIndex !== -1 && endIndex !== -1) {
    content = content.substring(0, startIndex) + content.substring(endIndex);
} else {
    // If emojis are missing or different, try regex
    content = content.replace(/\{\/\* .*?Divider .*?\*\/\}[\s\S]*?(?=\{\/\* .*?Switch to Register .*?\*\/\})/g, '');
}

fs.writeFileSync("src/pages/Login.jsx", content);
console.log("Login.jsx fixed");
