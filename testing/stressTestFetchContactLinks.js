const axios = require('axios');
const fetchContactLinks = require('../utils/fetchContactLinks');
const { performance } = require('perf_hooks');
const ProgressBar = require('progress');

async function fetchCompanyUrls() {
    try {
        const response = await axios.get('http://localhost:3000/api/company-url'); // Замените адрес на актуальный, если сервер запущен где-то еще
        return response.data; // Предполагается, что сервер возвращает массив URL
    } catch (error) {
        console.error('Ошибка при получении URL компаний:', error);
        return [];
    }
}

const extractDomain = (url) => {
    try {
        let companyURL = url.startsWith('http') ? url : `https://${url}`;
        let domain = new URL(companyURL).hostname.replace('www.', '');
        return domain;
    } catch (error) {
        console.error(`Error extracting domain from URL ${url}:`, error);
        return null;
    }
};

const stressTest = async (companyUrls) => {
    const iterations = 10; // Количество итераций на URL
    const concurrentCalls = 100; // Количество одновременных вызовов
    const totalOperations = companyUrls.length * iterations * concurrentCalls;
    let processedOperations = 0;

    const bar = new ProgressBar(':bar :current/:total (:percent) ETA: :eta seconds', {
        total: totalOperations,
        width: 40,
        complete: '=',
        incomplete: ' ',
    });

    console.log(`Starting stress test. Total operations: ${totalOperations}.`);

    const memoryUsageBefore = process.memoryUsage().heapUsed / 1024 / 1024;
    const startTime = performance.now();

    for (const url of companyUrls) {
        const domain = extractDomain(url);
        if (!domain) continue;

        const promises = [];
        for (let i = 0; i < iterations; i++) {
            for (let j = 0; j < concurrentCalls; j++) {
                promises.push(fetchContactLinks(url, domain).then(() => {
                    processedOperations++;
                    bar.tick();
                    if (processedOperations % (iterations * concurrentCalls) === 0) {
                        const memoryUsageCurrent = process.memoryUsage().heapUsed / 1024 / 1024;
                        console.log(`Current memory usage: ${memoryUsageCurrent.toFixed(2)} MB`);
                    }
                }));
            }
        }

        await Promise.all(promises);
    }

    const endTime = performance.now();
    const memoryUsageAfter = process.memoryUsage().heapUsed / 1024 / 1024;
    console.log(`Final memory usage: ${memoryUsageAfter.toFixed(2)} MB`);
    console.log(`Memory usage difference: ${(memoryUsageAfter - memoryUsageBefore).toFixed(2)} MB`);
    console.log(`Total execution time: ${((endTime - startTime) / 1000).toFixed(2)} seconds`);
};

fetchCompanyUrls().then(companyUrls => {
    stressTest(companyUrls)
        .then(() => console.log('Stress test completed'))
        .catch(err => console.error('Stress test failed:', err));
});