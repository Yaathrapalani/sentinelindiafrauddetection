import { Metadata } from 'next';
import { Lock, Mail, ShieldCheck } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

export const metadata: Metadata = {
  title: 'Admin',
  description: 'Researcher and admin access for Sentinel India.',
};

export default function AdminPage() {
  return (
    <div className="container mx-auto px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-md">
        <Card className="border-border shadow-lg">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
              <Lock className="h-7 w-7 text-primary" aria-hidden="true" />
            </div>
            <CardTitle className="text-2xl">Admin Login</CardTitle>
            <CardDescription>
              Researcher and administrator access for Sentinel India.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="researcher@sentinel.in"
                    className="pl-10"
                    autoComplete="email"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <ShieldCheck className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    className="pl-10"
                    autoComplete="current-password"
                    required
                  />
                </div>
              </div>
              <Button type="submit" className="w-full" size="lg">
                Sign In
              </Button>
            </form>
            <p className="mt-4 text-center text-xs text-muted-foreground">
              Admin access is restricted to authorized researchers and administrators.
              Contact the research team for access.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
