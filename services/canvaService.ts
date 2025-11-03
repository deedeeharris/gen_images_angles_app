// In a real application with a backend, you'd use the Canva Connect API.
// For this simulation, we download the image and then open Canva.

const downloadImage = (base64Image: string, angleName: string) => {
    const link = document.createElement('a');
    link.href = base64Image;
    const fileName = `generated-${angleName.replace(/[^a-z0-9א-ת]/gi, '_').toLowerCase()}.png`;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};


export const editWithCanva = (imageData: string, angleName: string): void => {
    
    downloadImage(imageData, angleName);

    alert(
        "חיבור ל-Canva:\n\n" +
        "התמונה שבחרת הורדה למחשב שלך באופן אוטומטי.\n\n" +
        "באפליקציה מלאה עם שרת אחורי, התמונה הייתה נשלחת ישירות לחשבון ה-Canva שלך.\n\n" +
        "כעת, חלון חדש עם Canva ייפתח. תוכל להעלות לשם את הקובץ שהרגע ירד ולהתחיל לערוך."
    );

    window.open('https://www.canva.com/', '_blank', 'noopener,noreferrer');
};
