// config/progressBarConfig.js
require('dotenv').config();
const cliProgress = require('cli-progress');

// Базовые настройки для одиночного и мульти прогресс-бара
const options = {
    singleBarOptions: {
        format: 'Прогресс |{bar}| {percentage}% || {value}/{total} Задач',
        barCompleteChar: '\u2588',
        barIncompleteChar: '\u2591',
        hideCursor: true
    },
    multiBarOptions: {
        format: 'Прогресс [{name}] |{bar}| {percentage}% || {value}/{total} Задач',
        barCompleteChar: '\u2588',
        barIncompleteChar: '\u2591',
        hideCursor: true,
        clearOnComplete: false,
        stopOnComplete: true
    }
};

class FakeProgressBar {
    start(total, startValue, payload) {}
    update(currentValue, payload) {}
    stop() {}
    // Добавляем метод create, возвращающий объект с методами increment и stop
    create(total, startValue, payload) {
        return {
            increment: () => {},
            stop: () => {}
        };
    }
}

// Преобразование строки переменной окружения в булево значение
const shouldShowProgressBar = process.env.PROGESS_BAR === 'true';

module.exports = {
    createSingleBar: (showProgressBar = shouldShowProgressBar) => showProgressBar
        ? new cliProgress.SingleBar(options.singleBarOptions, cliProgress.Presets.shades_classic)
        : new FakeProgressBar(),

    createMultiBar: (showProgressBar = shouldShowProgressBar) => showProgressBar
        ? new cliProgress.MultiBar(options.multiBarOptions, cliProgress.Presets.shades_grey)
        : new FakeProgressBar()
};
