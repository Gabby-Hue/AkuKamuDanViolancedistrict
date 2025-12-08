import { Metadata } from "next";
import { UserSettingsForm } from "./user-settings-form";

export const metadata: Metadata = {
  title: "Pengaturan Profil | CourtEase",
  description: "Kelola profil dan pengaturan akun CourtEase Anda",
};

export default function UserSettingsPage() {
  return (
    <div className="container mx-auto py-6">
      <UserSettingsForm />
    </div>
  );
}