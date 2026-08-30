from django.urls import path, include
from rest_framework.routers import DefaultRouter

# Import your ViewSets
from .views import (
    AuthViewSet,
    UserViewSet,
    ClubTransactionViewSet,
    ClubUserViewSet,
    WheelPrizeViewSet,
    DailyBonusPrizeViewSet,
    DailyBonusViewSet,
    SpinViewSet,
    PromocodePrizeViewSet,
    LeaderboardViewSet
)

router = DefaultRouter()

# Register the AuthViewSet
router.register(r'auth', AuthViewSet, basename='auth')
router.register(r'users', UserViewSet, basename='user')
router.register(r'club-users', ClubUserViewSet, basename='club-user')
router.register(r'transactions', ClubTransactionViewSet, basename='transaction')
router.register(r'wheel-prizes', WheelPrizeViewSet, basename='wheel-prize')
router.register(r'daily-bonus-prizes', DailyBonusPrizeViewSet, basename='daily-bonus-prize')
router.register(r'daily-bonuses', DailyBonusViewSet, basename='daily-bonus')
router.register(r'spins', SpinViewSet, basename='spin')
router.register(r'promocodes', PromocodePrizeViewSet, basename='promocode')
router.register(r'leaderboard', LeaderboardViewSet, basename='leaderboard')

urlpatterns = [
    path('', include(router.urls)),
]
