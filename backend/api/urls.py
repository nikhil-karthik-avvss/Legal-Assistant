from django.urls import path
from .views import login_view,get_profile,file_fir,get_unapproved_firs, get_fir_by_id, approve_fir, decline_fir,handle_fir_action,chat_with_assistant
from .views import hire_cop,change_cop_rank,fire_cop,lodge_complaint_view,get_complaint_status
from .views import get_pending_complaints,update_complaint,get_approved_complaints,get_declined_complaints
from .views import list_all_cops,get_fir_with_updates,add_fir_update,mark_fir_status,get_current_firs
from .views import view_past_firs,crime_analytics,add_citizen,view_all_citizens,get_citizens,view_citizen_details
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path("login/", login_view, name="login"),
    path("profile/", get_profile),
    path("file-fir/",file_fir),
    path('fir/unapproved/', get_unapproved_firs),
    path('fir/<str:fir_id>/', get_fir_by_id),
    #path('fir/<str:fir_id>/approve/', approve_fir),
    path("firs/<int:fir_id>/approve/", approve_fir, name="approve_fir"),
    path('fir/<str:fir_id>/decline/', decline_fir),
    path('firs/<str:fir_id>/<str:action>/', handle_fir_action),
    path('chat/', chat_with_assistant),
    path("cops/hire/", hire_cop, name="hire-cop"),
    path("cops/rank/", change_cop_rank, name="change-cop-rank"),
    path("cops/fire/", fire_cop, name="fire-cop"),
    path('complaints/file/', lodge_complaint_view),
    path("complaints/status/<complaint_id>/", get_complaint_status, name="get_complaint_status"),
    path("complaints/pending/", get_pending_complaints, name="get_pending_complaints"),
    path("complaints/update/<str:complaint_id>/", update_complaint, name="update_complaint"),
    path("complaints/approved/", get_approved_complaints, name="approved_complaints"),
    path("complaints/declined/", get_declined_complaints, name="declined_complaints"),
    path("cops/all/", list_all_cops, name="list_all_cops"),
    path('firs/current', get_current_firs, name='get_current_firs'),
    path('fir/<int:fir_id>/with-updates', get_fir_with_updates, name='get_fir_with_updates'),
    path('fir/<int:fir_id>/add-update/', add_fir_update, name='add_fir_update'),
    path('fir/<int:fir_id>/set-status/', mark_fir_status, name='mark_fir_status'),
    path("fir/view-past-firs", view_past_firs, name="view-past-firs"),
    path("analytics/crime", crime_analytics),
    path('citizens', get_citizens, name='citizens-list'),
    path('citizens/add/', add_citizen),
    path('citizens/all/', view_all_citizens, name='view_all_citizens'),
    path('citizens/<str:citizen_id>/details/', view_citizen_details, name='view_citizen_details'),
    
    #/api/fir/1/with-updates
]#+ static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
