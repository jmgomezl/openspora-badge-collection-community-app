import { useState } from 'react';
import { useSaveCallerUserProfile } from '../hooks/useQueries';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useLanguage } from '../lib/i18n';

export default function ProfileSetupModal() {
  const [name, setName] = useState('');
  const { mutate: saveProfile, isPending } = useSaveCallerUserProfile();
  const { t } = useLanguage();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      saveProfile({ name: name.trim() });
    }
  };

  return (
    <Dialog open={true}>
      <DialogContent className="sm:max-w-md" onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <div className="flex justify-center mb-4">
            <img 
              src="/assets/generated/openspora-logo-transparent.dim_200x200.png" 
              alt="OpenSpora Logo" 
              className="w-20 h-20"
            />
          </div>
          <DialogTitle className="text-center text-2xl">{t('profile.welcome')}</DialogTitle>
          <DialogDescription className="text-center">
            {t('profile.setupDesc')}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">{t('profile.yourName')}</Label>
            <Input
              id="name"
              placeholder={t('profile.enterName')}
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isPending}
              autoFocus
            />
          </div>
          <Button type="submit" className="w-full" disabled={!name.trim() || isPending}>
            {isPending ? t('profile.settingUp') : t('profile.continue')}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
