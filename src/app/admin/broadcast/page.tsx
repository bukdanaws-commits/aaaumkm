'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Radio, Send, Loader2, MessageSquare, Users, CheckCircle2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';

interface Broadcast {
  id: string;
  title: string;
  message: string;
  target: string;
  recipientCount: number;
  createdAt: Date;
}

const targetLabels: Record<string, string> = {
  all: 'Semua Pengguna',
  sellers: 'Penjual',
  buyers: 'Pembeli',
  verified: 'Terverifikasi KYC',
};

export default function AdminBroadcast() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [broadcasts, setBroadcasts] = useState<Broadcast[]>([]);
  const [form, setForm] = useState({
    title: '',
    message: '',
    target: 'all',
  });

  const fetchHistory = async () => {
    try {
      setLoadingHistory(true);
      const response = await fetch('/api/admin/broadcast');
      if (!response.ok) throw new Error('Failed to fetch');
      const data = await response.json();
      setBroadcasts(data.broadcasts || []);
    } catch (error) {
      console.error('Error fetching broadcast history:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Gagal memuat riwayat broadcast',
      });
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleSend = async () => {
    if (!form.title || !form.message) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Judul dan pesan harus diisi',
      });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/admin/broadcast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      if (!response.ok) throw new Error('Failed to send broadcast');

      const data = await response.json();

      toast({
        title: 'Broadcast Terkirim!',
        description: `Berhasil mengirim ke ${data.recipientCount} pengguna`,
      });

      // Reset form
      setForm({
        title: '',
        message: '',
        target: 'all',
      });

      // Refresh history
      fetchHistory();
    } catch (error) {
      console.error('Error sending broadcast:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Gagal mengirim broadcast',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Broadcast Notifikasi</h1>
        <p className="text-muted-foreground">Kirim notifikasi ke pengguna platform</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-l-4 border-l-blue-500 bg-gradient-to-br from-blue-50 to-white dark:from-blue-950/20 dark:to-background">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-blue-700 dark:text-blue-400">
              Total Broadcast
            </CardTitle>
            <Radio className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-700 dark:text-blue-400">{broadcasts.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Broadcast terkirim</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500 bg-gradient-to-br from-green-50 to-white dark:from-green-950/20 dark:to-background">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-green-700 dark:text-green-400">
              Total Penerima
            </CardTitle>
            <Users className="h-4 w-4 text-green-600 dark:text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-700 dark:text-green-400">
              {broadcasts.reduce((sum, b) => sum + b.recipientCount, 0)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Notifikasi terkirim</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500 bg-gradient-to-br from-purple-50 to-white dark:from-purple-950/20 dark:to-background">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-purple-700 dark:text-purple-400">
              Broadcast Hari Ini
            </CardTitle>
            <CheckCircle2 className="h-4 w-4 text-purple-600 dark:text-purple-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-700 dark:text-purple-400">
              {broadcasts.filter(b => {
                const today = new Date();
                const broadcastDate = new Date(b.createdAt);
                return broadcastDate.toDateString() === today.toDateString();
              }).length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Hari ini</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Radio className="h-5 w-5" />
              Kirim Broadcast
            </CardTitle>
            <CardDescription>Kirim pesan ke semua pengguna atau target tertentu</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Judul</Label>
              <Input 
                placeholder="Judul notifikasi"
                value={form.title}
                onChange={(e) => setForm({...form, title: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label>Pesan</Label>
              <Textarea 
                placeholder="Isi pesan broadcast..."
                rows={6}
                value={form.message}
                onChange={(e) => setForm({...form, message: e.target.value})}
              />
              <p className="text-xs text-muted-foreground">
                {form.message.length} karakter
              </p>
            </div>
            <div className="space-y-2">
              <Label>Target Penerima</Label>
              <Select value={form.target} onValueChange={(v) => setForm({...form, target: v})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      Semua Pengguna
                    </div>
                  </SelectItem>
                  <SelectItem value="sellers">
                    <div className="flex items-center gap-2">
                      <MessageSquare className="h-4 w-4" />
                      Penjual (Punya Iklan)
                    </div>
                  </SelectItem>
                  <SelectItem value="buyers">
                    <div className="flex items-center gap-2">
                      <MessageSquare className="h-4 w-4" />
                      Pembeli (Pernah Order)
                    </div>
                  </SelectItem>
                  <SelectItem value="verified">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4" />
                      Terverifikasi KYC
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button 
              onClick={handleSend} 
              disabled={loading || !form.title || !form.message}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Mengirim...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Kirim Broadcast
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Riwayat Broadcast</CardTitle>
            <CardDescription>Broadcast yang telah dikirim ({broadcasts.length})</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 max-h-[600px] overflow-y-auto">
            {loadingHistory ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : broadcasts.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Radio className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>Belum ada broadcast terkirim</p>
              </div>
            ) : (
              broadcasts.map((broadcast) => (
                <div key={broadcast.id} className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex items-start justify-between mb-2">
                    <p className="font-medium">{broadcast.title}</p>
                    <Badge variant="secondary" className="text-xs">
                      {format(new Date(broadcast.createdAt), 'dd MMM yyyy', { locale: idLocale })}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                    {broadcast.message}
                  </p>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      Target: {targetLabels[broadcast.target] || broadcast.target}
                    </span>
                    <span className="flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3" />
                      {broadcast.recipientCount} terkirim
                    </span>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
