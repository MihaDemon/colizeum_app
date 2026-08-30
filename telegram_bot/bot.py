import os
from dotenv import load_dotenv
import asyncio
import logging
import sys
from aiogram import Bot, Dispatcher, types
from aiogram.filters import CommandStart
from aiogram.types import (
    WebAppInfo,
    InlineKeyboardMarkup,
    InlineKeyboardButton
)

load_dotenv()

# Replace with your actual Telegram Bot Token from BotFather
TOKEN = os.getenv('TELEGRAM_BOT_TOKEN')


WEBAPP_URL = os.getenv('WEBAPP_URL')

# Initialize Bot and Dispatcher
bot = Bot(token=TOKEN)
dp = Dispatcher()


@dp.message(CommandStart())
async def command_start_handler(message: types.Message) -> None:
    """
    Handles the /start command and sends an inline button to open the Mini App.
    """
    user_name = message.from_user.first_name

    # Create an Inline Keyboard with a WebApp button
    keyboard = InlineKeyboardMarkup(
        inline_keyboard=[
            [
                InlineKeyboardButton(
                    text="🎮 Открыть Колесо Фортуны",
                    web_app=WebAppInfo(url=WEBAPP_URL)
                )
            ]
        ]
    )

    await message.answer(
        f"Привет, {user_name}! Добро пожаловать в Colizeum Perovo.\n"
        "Кликай по кнопке ниже, крути колесо и забирай призы!",
        reply_markup=keyboard
    )


async def main() -> None:
    # Start polling for updates
    await dp.start_polling(bot)


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO, stream=sys.stdout)
    asyncio.run(main())
