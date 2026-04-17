from django.urls import path
from .views_auth import RegisterView, PendingUsersView, ReviewUserView
from .views_alunos import MyAlunosView
from .views import MeView  # seu MeView atual

urlpatterns = [
    path("auth/register/", RegisterView.as_view()),
    path("auth/me/", MeView.as_view()),
    path("auth/pending-users/", PendingUsersView.as_view()),
    path("auth/review-user/<int:user_id>/", ReviewUserView.as_view()),
    path("professor/meus-alunos/", MyAlunosView.as_view()),
]
