import { Heart, Info } from 'lucide-react';
import { useLanguage } from '../lib/i18n';
import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

export default function Footer() {
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  
  return (
    <footer className="border-t border-border bg-card/30 backdrop-blur-sm mt-auto">
      <div className="container mx-auto px-4 py-6">
        <div className="text-center text-sm text-muted-foreground space-y-2">
          <p className="flex items-center justify-center gap-2">
            © 2025. {t('footer.builtWith')} <Heart className="w-4 h-4 text-accent fill-accent" /> {t('footer.using')}{' '}
            <a 
              href="https://caffeine.ai" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-primary hover:underline font-medium"
            >
              caffeine.ai
            </a>
          </p>
          <div>
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-muted-foreground hover:text-primary h-auto py-1 px-2"
                >
                  <Info className="w-3 h-3 mr-1" />
                  {t('footer.about')}
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <img 
                      src="/assets/generated/openspora-logo-transparent.dim_200x200.png" 
                      alt="OpenSpora Logo" 
                      className="w-8 h-8"
                    />
                    {t('about.title')}
                  </DialogTitle>
                  <DialogDescription className="pt-4 text-base leading-relaxed">
                    {t('about.product')}
                  </DialogDescription>
                </DialogHeader>
                <div className="flex justify-end mt-4">
                  <Button onClick={() => setOpen(false)} variant="default">
                    {t('about.close')}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>
    </footer>
  );
}
