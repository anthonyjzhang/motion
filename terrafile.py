import terra

API_KEY = "YJiQtNGcQAqT7f5axb7U0EdB2RNc_f67"
DEV_ID = "fouralpha-testing-868lIdxcwj"
SECRET = "secret"

terra = terra.base_client.Terra(API_KEY, DEV_ID, SECRET)

parsed_api_response_providers = terra.list_providers().get_parsed_response()
print(parsed_api_response_providers)

parsed_api_response_users = terra.list_users().get_parsed_response()
print(parsed_api_response_users)

widget_response = terra.generate_widget_session(
    reference_id="USER ID IN YOUR APP", #optional
    providers=["APPLE", "GOOGLE", "FITBIT", "GARMIN", "SAMSUNG"], #optional
    auth_success_redirect_url="https://success.url",  #optional
    auth_failure_redirect_url="https://failure.url",  #optional
    language="en"
).get_parsed_response()

print(widget_response)