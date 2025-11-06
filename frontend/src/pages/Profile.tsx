import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { User, Mail, Lock, Save } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuthStore } from '../store/authStore';
import authService from '../services/auth.service';
import Card from '../components/common/Card';
import Input from '../components/common/Input';
import Button from '../components/common/Button';

interface ProfileFormData {
  name: string;
  email: string;
}

interface PasswordFormData {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}

const Profile = () => {
  const { user, updateProfile } = useAuthStore();
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const {
    register: registerProfile,
    handleSubmit: handleSubmitProfile,
    formState: { errors: profileErrors },
  } = useForm<ProfileFormData>({
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
    },
  });

  const {
    register: registerPassword,
    handleSubmit: handleSubmitPassword,
    watch,
    reset: resetPasswordForm,
    formState: { errors: passwordErrors },
  } = useForm<PasswordFormData>();

  const newPassword = watch('newPassword');

  const onSubmitProfile = async (data: ProfileFormData) => {
    setIsUpdatingProfile(true);
    try {
      await updateProfile(data);
      toast.success('Profile updated successfully!');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const onSubmitPassword = async (data: PasswordFormData) => {
    setIsChangingPassword(true);
    try {
      await authService.changePassword(data.oldPassword, data.newPassword);
      toast.success('Password changed successfully!');
      resetPasswordForm();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to change password');
    } finally {
      setIsChangingPassword(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">My Profile</h1>

      <div className="max-w-2xl mx-auto space-y-6">
        {/* Profile Information */}
        <Card>
          <div className="flex items-center gap-2 mb-6">
            <User className="h-5 w-5 text-primary-600" />
            <h2 className="text-xl font-bold">Profile Information</h2>
          </div>

          <form onSubmit={handleSubmitProfile(onSubmitProfile)} className="space-y-4">
            <Input
              label="Full Name"
              type="text"
              placeholder="Enter your full name"
              leftIcon={<User className="h-5 w-5" />}
              error={profileErrors.name?.message}
              {...registerProfile('name', {
                required: 'Name is required',
                minLength: {
                  value: 2,
                  message: 'Name must be at least 2 characters',
                },
              })}
            />

            <Input
              label="Email"
              type="email"
              placeholder="Enter your email"
              leftIcon={<Mail className="h-5 w-5" />}
              error={profileErrors.email?.message}
              {...registerProfile('email', {
                required: 'Email is required',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'Invalid email address',
                },
              })}
            />

            <div className="flex justify-end">
              <Button
                type="submit"
                variant="primary"
                leftIcon={<Save className="h-5 w-5" />}
                isLoading={isUpdatingProfile}
              >
                Save Changes
              </Button>
            </div>
          </form>
        </Card>

        {/* Change Password */}
        <Card>
          <div className="flex items-center gap-2 mb-6">
            <Lock className="h-5 w-5 text-primary-600" />
            <h2 className="text-xl font-bold">Change Password</h2>
          </div>

          <form onSubmit={handleSubmitPassword(onSubmitPassword)} className="space-y-4">
            <Input
              label="Current Password"
              type="password"
              placeholder="Enter current password"
              leftIcon={<Lock className="h-5 w-5" />}
              error={passwordErrors.oldPassword?.message}
              {...registerPassword('oldPassword', {
                required: 'Current password is required',
              })}
            />

            <Input
              label="New Password"
              type="password"
              placeholder="Enter new password"
              leftIcon={<Lock className="h-5 w-5" />}
              error={passwordErrors.newPassword?.message}
              helperText="Must be at least 6 characters"
              {...registerPassword('newPassword', {
                required: 'New password is required',
                minLength: {
                  value: 6,
                  message: 'Password must be at least 6 characters',
                },
              })}
            />

            <Input
              label="Confirm New Password"
              type="password"
              placeholder="Confirm new password"
              leftIcon={<Lock className="h-5 w-5" />}
              error={passwordErrors.confirmPassword?.message}
              {...registerPassword('confirmPassword', {
                required: 'Please confirm your password',
                validate: (value) => value === newPassword || 'Passwords do not match',
              })}
            />

            <div className="flex justify-end">
              <Button
                type="submit"
                variant="primary"
                leftIcon={<Lock className="h-5 w-5" />}
                isLoading={isChangingPassword}
              >
                Change Password
              </Button>
            </div>
          </form>
        </Card>

        {/* Account Information */}
        <Card>
          <h2 className="text-xl font-bold mb-4">Account Information</h2>
          <div className="space-y-3">
            <div className="flex justify-between py-2 border-b">
              <span className="text-gray-600">Account Type</span>
              <span className="font-medium capitalize">{user?.role}</span>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span className="text-gray-600">Member Since</span>
              <span className="font-medium">
                {user?.createdAt && new Date(user.createdAt).toLocaleDateString()}
              </span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-gray-600">Last Updated</span>
              <span className="font-medium">
                {user?.updatedAt && new Date(user.updatedAt).toLocaleDateString()}
              </span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Profile;


