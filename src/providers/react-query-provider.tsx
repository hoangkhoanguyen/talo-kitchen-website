"use client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React, { FC, memo, PropsWithChildren, useState } from "react";

const ReactQueryProvider: FC<PropsWithChildren<{ client: QueryClient }>> = ({
  children,
  client,
}) => {
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
};

export const AdminQueryProvider: FC<PropsWithChildren> = memo(
  ({ children }) => {
    const [client] = useState(
      () =>
        new QueryClient({
          defaultOptions: {
            queries: {
              refetchOnWindowFocus: false,
            },
          },
        }),
    );
    return <ReactQueryProvider client={client}>{children}</ReactQueryProvider>;
  },
);

AdminQueryProvider.displayName = "AdminQueryProvider";

export const WebsiteQueryProvider: FC<PropsWithChildren> = memo(
  ({ children }) => {
    const client = new QueryClient();
    return <ReactQueryProvider client={client}>{children}</ReactQueryProvider>;
  },
);

WebsiteQueryProvider.displayName = "WebsiteQueryProvider";
