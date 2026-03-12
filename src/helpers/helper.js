export const randomMinMax = (min, max) => Math.random() * (max - min) + min;

export const getRandomInt = (min, max) => {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

export const randomFromArr = arr => arr[Math.floor(Math.random() * arr.length)];

