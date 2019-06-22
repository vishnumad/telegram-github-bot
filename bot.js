const TelegramBot = require('node-telegram-bot-api');
const fetch = require('node-fetch');

const TOKEN = process.env.TELEGRAM_TOKEN;

const bot = new TelegramBot(TOKEN);

function searchGithub(query) {
  const searchQuery = query.replace(" ", "+");
  
  return fetch(`https://api.github.com/search/repositories?q=${searchQuery}&sort=stars&order=desc`)
    .then(status)
    .then(asJson)
    .then(response => {
      let repos = [];
    
      let size = response.items.length;
      if (size > 10) size = 10;
    
      let repo;
    
      for (let i = 0; i < size; i++) {
        
        repo = response.items[i];
        
        repos.push({
          type: 'article',
          id: repo.id.toString(),
          title: `${repo.full_name} (${repo.stargazers_count} ★)`,
          description: `${repo.description}\n[Language: ${repo.language}]`,
          message_text: `${repo.html_url}\n${repo.description}\n[${repo.stargazers_count} ★][${repo.language}]`,
          url: repo.html_url
        });
      }
    
      return Promise.resolve(repos);
    });
}

function asJson(response) {
  return response.json();
}

function status(response) {
  if (response.status >= 200 && response.status < 300) {
    return Promise.resolve(response)
  } else {
    return Promise.reject(new Error(response.statusText))
  }
}

bot.setWebHook(`https://${process.env.PROJECT_NAME}.glitch.me/bot${TOKEN}`);

bot.onText(/\/ping/, message => {
  bot.sendMessage(message.chat.id, 'It\'s stuffy in this server! 😓');
});

bot.onText(/\/start/, message => {
  bot.sendMessage(message.chat.id, 'Use @githubbub_bot <query>');
});

bot.onText(/\/help/, message => {
  bot.sendMessage(message.chat.id, 'Use @githubbub_bot <query>');
});

bot.on('inline_query', query => {  
  
  if (query.query.length == 0) return;
  
  searchGithub(query.query)
    .then(repos => {
      bot.answerInlineQuery(query.id, repos);
    })
    .catch(error => {
      console.log(error);
    });
});

bot.URL = `/bot${TOKEN}`;

module.exports = bot;
