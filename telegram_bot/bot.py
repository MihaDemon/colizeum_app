import os
from dotenv import load_dotenv
import asyncio
import logging
import sys
from aiogram import Bot, Dispatcher, types, F
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
TELEGRAM_CHANNEL_URL = os.getenv('TELEGRAM_CHANNEL_URL', '').strip()
CLUB_NAME = os.getenv('CLUB_NAME', '').strip() or 'Клуб'

# Initialize Bot and Dispatcher
bot = Bot(token=TOKEN)
dp = Dispatcher()


@dp.message(CommandStart())
async def command_start_handler(message: types.Message) -> None:
    """
    Handles the /start command and sends an inline button to open the Mini App.
    """
    user_name = message.from_user.first_name

    # Keep the Mini App button first and add the channel button only when its
    # URL is configured in the environment.
    keyboard_buttons = [
        [
            InlineKeyboardButton(
                text="Открыть Colizeum HUB",
                web_app=WebAppInfo(url=WEBAPP_URL)
            )
        ]
    ]

    if TELEGRAM_CHANNEL_URL:
        keyboard_buttons.append([
            InlineKeyboardButton(
                text="Наш Telegram-канал",
                url=TELEGRAM_CHANNEL_URL
            )
        ])

    keyboard = InlineKeyboardMarkup(
        inline_keyboard=keyboard_buttons
    )

    await message.answer(
        f"Привет, {user_name}! Добро пожаловать в Colizeum {CLUB_NAME}.\n"
        "Кликай по кнопке ниже, крути колесо и забирай призы!",
        reply_markup=keyboard
    )


@dp.message(F.contact)
async def delete_contact_handler(message: types.Message) -> None:
    """
    Automatically deletes contact cards sent by users to clean up chat history.
    """
    try:
        await message.delete()
    except Exception as e:
        logging.warning(f"Could not delete contact message: {e}")


async def main() -> None:
    # Start polling for updates
    await dp.start_polling(bot)


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO, stream=sys.stdout)
    asyncio.run(main())
