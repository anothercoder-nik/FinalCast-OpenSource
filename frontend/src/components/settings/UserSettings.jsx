import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { User, Shield, Settings } from 'lucide-react';
import TwoFactorSetup from '../auth/TwoFactorSetup';

const UserSettings = () => {
  const [tab, setTab] = useState('profile');

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600">Manage your account settings</p>
      </div>

      <Tabs value={tab} onValueChange={setTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="profile" className="gap-2"><User size={16} /> Profile</TabsTrigger>
          <TabsTrigger value="security" className="gap-2"><Shield size={16} /> Security</TabsTrigger>
          <TabsTrigger value="general" className="gap-2"><Settings size={16} /> General</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card>
            <CardHeader><CardTitle>Profile Information</CardTitle></CardHeader>
            <CardContent className="text-gray-600">Profile settings coming soon...</CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          {/* 2FA Setup Component */}
          <TwoFactorSetup />
        </TabsContent>

        <TabsContent value="general">
          <Card>
            <CardHeader><CardTitle>General Settings</CardTitle></CardHeader>
            <CardContent className="text-gray-600">General settings coming soon...</CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default UserSettings;
