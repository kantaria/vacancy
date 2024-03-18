// config/progressBarConfig.js
const cliProgress = require('cli-progress');

// Базовые настройки для одиночного прогресс-бара
const singleBarOptions = {
    format: 'Прогресс |{bar}| {percentage}% || {value}/{total} Задач',
    barCompleteChar: '\u2588',
    barIncompleteChar: '\u2591',
    hideCursor: true
};

// Базовые настройки для мульти прогресс-бара
const multiBarOptions = {
    format: 'Прогресс [{name}] |{bar}| {percentage}% || {value}/{total} Задач',
    barCompleteChar: '\u2588',
    barIncompleteChar: '\u2591',
    hideCursor: true,
    clearOnComplete: false,
    stopOnComplete: true
};

// Экспортируем функции для создания прогресс-баров
module.exports = {
    createSingleBar: () => new cliProgress.SingleBar(singleBarOptions, cliProgress.Presets.shades_classic),
    createMultiBar: () => new cliProgress.MultiBar(multiBarOptions, cliProgress.Presets.shades_grey)
};
