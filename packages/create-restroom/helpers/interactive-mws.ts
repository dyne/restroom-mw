import { mws } from './mws'
import prompts from 'prompts'

const choices: { title: string, value: string }[] = [];
for (const mw of mws) {
  choices.push({
    title: mw,
    value: mw,
  });
}

export const interactive_mws = async () => {
  const response = await prompts([
    {
      type: 'multiselect',
      name: 'middlewares',
      message: `Chose the restroom's middleware to include`,
      choices: choices,
    }
  ]);

  return response.middlewares;
};
