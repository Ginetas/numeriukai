import LiveVideoPlayer from '../../../../../components/live/LiveVideoPlayer';

type Props = { params: { id: string } };

const CameraLivePage = ({ params }: Props) => {
  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">Camera {params.id} Live</h1>
      <LiveVideoPlayer cameraId={params.id} backendUrl={process.env.NEXT_PUBLIC_BACKEND_URL || ''} />
    </div>
  );
};

export default CameraLivePage;
