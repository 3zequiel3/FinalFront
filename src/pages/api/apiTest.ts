const apiUrl = import.meta.env.VITE_API_URL;

fetch(apiUrl + 'ping')
    .then(res => res.text())
    .then(data => console.log(data));
