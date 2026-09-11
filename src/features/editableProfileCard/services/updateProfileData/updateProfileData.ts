// entities/Profile/model/services/updateProfileData/updateProfileData.ts
import { createAsyncThunk } from "@reduxjs/toolkit";
import { StateSchema, ThunkConfig } from "@/app/providers/StoreProvider";
import { validateProfileData } from "../validateProfileData/validateProfileData";
import { getProfileForm } from "../../selectors/getProfileForm/getProfileForm";
import { ValidateProfileError } from "../../types/editableProfileCardSchema";
import { Profile } from "@/entities/Profile";

export const updateProfileData = createAsyncThunk<
  Profile,
  void,
  ThunkConfig<ValidateProfileError[]>
>("profile/updateProfileData", async (_, thunkApi) => {
  const { extra, rejectWithValue, getState } = thunkApi;

  try {
    const state = getState() as StateSchema;
    const formData = getProfileForm(state);

    const errors = validateProfileData(formData);

    if (errors.length) {
      return rejectWithValue(errors);
    }

    const response = await extra.api.put<Profile>(
      "/profile/" + formData?.id,
      formData,
    );

    if (!response.data) {
      throw new Error();
    }

    return response.data;
  } catch (e) {
    console.log(e);
    return rejectWithValue([ValidateProfileError.SERVER_ERROR]);
  }
});
