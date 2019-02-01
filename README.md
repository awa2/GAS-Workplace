# GAS-Workplace
Workplace module for GAS that written by TypeScript

## Usage
```TypeScript
import {Workplace, Post } from '@ts-module-for-gas/gas-workplace';

const workplacebot = new Workplace.Bot(PropertiesService.getScriptProperties().getProperty('WORKPLACE_BOT_TOKEN') as string);
const group_id = PropertiesService.getScriptProperties().getProperty('WORKPLACE_GROUP_ID') as string;
const thread_key = PropertiesService.getScriptProperties().getProperty('WORKPLACE_THREAD_KEY') as string;

function test_Bot_post() {
    const post = workplacebot.post(group_id, "This is submitted by bot!",'https://google.com/');
    const res = workplacebot.chat(thread_key, "You've got a message!")
};

```
