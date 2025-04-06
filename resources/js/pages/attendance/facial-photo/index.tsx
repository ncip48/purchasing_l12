import Container from '@/components/container';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem, PageProps } from '@/types';
import { FaceType } from '@/types/face';
import { Head, usePage } from '@inertiajs/react';
import { PlusIcon } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Attendance',
        href: '#',
    },
    {
        title: 'Facial Photo',
        href: '/attendance/facial-photo',
    },
];

function Page() {
    const { face } = usePage<PageProps<{ face: FaceType }>>().props;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Facial Photo" />
            <Container>
                <Card>
                    <CardContent>
                        <div className="mb-4 flex items-center justify-between">
                            <h2 className="mb-4 text-xl font-bold">Facial Photo</h2>
                            <Button onClick={() => {}}>
                                <PlusIcon />
                                Add Photo
                            </Button>
                        </div>
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                            <Card className="gap-0 overflow-hidden rounded-2xl p-0 shadow-md">
                                <img src={`/img/${face.photo || ''}`} alt={`Registered Face`} className="h-60 w-full object-cover" />
                                <CardContent className="p-4 text-center">
                                    <p className="text-muted-foreground text-sm font-medium">Registered Face</p>
                                </CardContent>
                            </Card>
                        </div>
                    </CardContent>
                </Card>
            </Container>
        </AppLayout>
    );
}

export default Page;
