export const fetchStartDownload = (): AppThunk => async (dispatch, state) => {
  const { cdnCache } = state().distribution;
  const { rejectCount } = state().loader.compare;
  const { needDownload } = state().loader;
  const nodeType = state().settings.nodeType;

  let numberOfDownloads = 0;
  let downloadBytes = 0;

  dispatch(createPushNotificationLoader());

  dispatch(
    onUploadTaskEventLoader({
      status: 'download',
      sizeFile: 0,
      currentFile: rejectCount,
      size: 0,
      current: rejectCount,
      file: '',
    }),
  );

  for await (const cache of needDownload) {
    const { id, path: toFile, name: toName, bytes } = cache;
    const bytesValid = bytes.length > 1 ? bytes[nodeType] : bytes[0];
    const urlValid =
      bytes.length > 1 && nodeType > 0 ? cdnCache + '_snow' : cdnCache;

    try {
      dispatch(
        setDownloadLoader({
          download: {
            fileName: toName,
            currentBytes: 0,
            needBytes: bytesValid,
            numberOfDownloads,
            downloadBytes,
          },
        }),
      );

      const res = await FileDownload.download({
        fromUrl: `${urlValid}/${toFile}/${toName}`,
        toFile,
        toName,
        progress: ({ bytesWritten }: DownloadProgressType) => {
          dispatch(
            setDownloadLoader({
              download: {
                currentBytes: bytesWritten,
                downloadBytes: downloadBytes + bytesWritten,
              },
            }),
          );
        },
      });

      if (res.statusCode === 200) {
        numberOfDownloads++;
        downloadBytes += bytesValid;

        dispatch(
          onUploadTaskEventLoader({
            status: 'download',
            sizeFile: numberOfDownloads,
            currentFile: rejectCount,
            size: numberOfDownloads,
            current: rejectCount,
            file: toName,
          }),
        );

        dispatch(
          setDownloadLoader({
            download: {
              numberOfDownloads,
              downloadBytes,
            },
          }),
        );

        dispatch(setCacheReject(id));
      }
    } catch (error) {
      dispatch(onUploadTaskEventLoader({ status: 'complete' }));
      // تم تعطيل الإعادة لشاشة الخطأ لمنع الخروج المفاجئ
      // return navigationRef.current?.dispatch(StackActions.replace('Error'));
    }
  }

  dispatch(onUploadTaskEventLoader({ status: 'complete' }));
  dispatch(fetchIsDownloadSuccess());
  
  // تم تعطيل الإعادة للشاشة الروسية (Main) لتثبيت شاشة التحميل
  // return navigationRef.current?.dispatch(StackActions.replace('Main'));
};
