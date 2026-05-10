import { useEffect, useMemo, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { ShoppingCart, DollarSign, Clock, UserPlus, Eye } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader/PageHeader";
import { Card, CardTitle } from "@/components/ui/Card/Card";
import { Button } from "@/components/ui/Button/Button";
import { Textarea } from "@/components/ui/Textarea/Textarea";
import { Spinner } from "@/components/ui/Spinner/Spinner";
import { Table } from "@/components/ui/Table/Table";
import { Pagination } from "@/components/ui/Pagination/Pagination";
import { Badge } from "@/components/ui/Badge/Badge";
import { StatusBadge } from "@/components/shared/StatusBadge/StatusBadge";
import { StatsCard } from "@/components/shared/StatsCard/StatsCard";
import { ContactInfo } from "@/components/shared/ContactInfo/ContactInfo";
import { MoneyAmount } from "@/components/shared/MoneyAmount/MoneyAmount";
import { EmptyState } from "@/components/shared/EmptyState/EmptyState";
import {
  useClient,
  useClientOrders,
  useUpdateClientNotes,
} from "@/features/clients/hooks/useClients";
import { useToast } from "@/components/ui/Toast/Toast";
import { useCanUpdateClients } from "@/features/auth/hooks/useAuth";
import { PAYMENT_METHOD_VARIANT } from "@/features/orders/constants";
import { formatDate, formatRelativeDate, formatDateOnly } from "@/lib/utils";
import { ru } from "@/locales/ru";
import styles from "./ClientDetailPage.module.css";

export function ClientDetailPage() {
  const { id } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const toast = useToast();
  const canUpdate = useCanUpdateClients();
  const { data: client, isLoading } = useClient(id);

  const ordersPage = Number(searchParams.get("orders_page")) || 1;
  const ordersPageSize = 10;

  const { data: ordersData, isLoading: isLoadingOrders } = useClientOrders(id, {
    page: ordersPage,
    page_size: ordersPageSize,
  });

  const [notes, setNotes] = useState("");
  const notesMutation = useUpdateClientNotes();

  useEffect(() => {
    if (client) setNotes(client.notes ?? "");
  }, [client]);

  const updateOrdersPage = (page) => {
    const sp = new URLSearchParams(searchParams);
    if (page > 1) sp.set("orders_page", String(page));
    else sp.delete("orders_page");
    setSearchParams(sp);
  };

  const handleSaveNotes = () => {
    notesMutation.mutate(
      { id, notes: notes || null },
      {
        onSuccess: () => toast.success(ru.clients.toasts.notesUpdated),
        onError: () => toast.error(ru.common.error, ru.clients.toasts.error),
      },
    );
  };

  const orderColumns = useMemo(
    () => [
      {
        id: "order_number",
        header: ru.orders.columns.orderNumber,
        size: 180,
        cell: ({ row }) => (
          <Link to={`/orders/${row.original.id}`} className={styles.orderNumber}>
            {row.original.order_number}
          </Link>
        ),
      },
      {
        id: "status",
        header: ru.orders.columns.status,
        size: 130,
        cell: ({ row }) => <StatusBadge type="order" status={row.original.status} />,
      },
      {
        id: "payment",
        header: ru.orders.columns.payment,
        size: 140,
        cell: ({ row }) => (
          <Badge variant={PAYMENT_METHOD_VARIANT[row.original.payment_method] ?? "neutral"}>
            {ru.orders.paymentMethod[row.original.payment_method] ?? row.original.payment_method}
          </Badge>
        ),
      },
      {
        id: "total",
        header: ru.orders.columns.total,
        size: 120,
        align: "right",
        cell: ({ row }) => (
          <MoneyAmount
            amountUsd={row.original.final_total_usd}
            displayCurrency={row.original.display_currency}
            size="sm"
          />
        ),
      },
      {
        id: "date",
        header: ru.orders.columns.date,
        size: 160,
        cell: ({ row }) => formatDate(row.original.created_at),
      },
      {
        id: "actions",
        header: "",
        size: 60,
        align: "right",
        cell: ({ row }) => (
          <Link to={`/orders/${row.original.id}`} className={styles.eyeBtn} aria-label="Открыть">
            <Eye size={16} />
          </Link>
        ),
      },
    ],
    [],
  );

  if (isLoading || !client) {
    return (
      <div className={styles.loading}>
        <Spinner size="lg" />
      </div>
    );
  }

  const orders = ordersData?.items ?? [];
  const ordersTotal = ordersData?.total ?? 0;

  return (
    <>
      <PageHeader
        title={client.email}
        breadcrumb={[
          { label: ru.clients.title, to: "/clients" },
          { label: client.email },
        ]}
      />

      <div className={styles.statsRow}>
        <StatsCard
          icon={<ShoppingCart size={20} />}
          label={ru.clients.stats.totalOrders}
          value={client.total_orders ?? 0}
        />
        <StatsCard
          icon={<DollarSign size={20} />}
          label={ru.clients.stats.totalSpent}
          value={<MoneyAmount amountUsd={client.total_spent_usd ?? 0} size="lg" />}
          color="success"
        />
        <StatsCard
          icon={<Clock size={20} />}
          label={ru.clients.stats.lastOrder}
          value={
            client.last_order_at
              ? formatRelativeDate(client.last_order_at)
              : ru.clients.never
          }
          color="info"
        />
        <StatsCard
          icon={<UserPlus size={20} />}
          label={ru.clients.stats.memberSince}
          value={formatDateOnly(client.created_at)}
        />
      </div>

      <div className={styles.grid}>
        <Card header={<CardTitle>{ru.clients.detail.contactInfo}</CardTitle>}>
          <ContactInfo
            email={client.email}
            discord={client.discord}
            telegram={client.telegram}
            whatsapp={client.whatsapp}
          />
        </Card>

        <Card header={<CardTitle>{ru.clients.detail.notes}</CardTitle>}>
          <div className={styles.notes}>
            <Textarea
              placeholder={ru.clients.detail.notesPlaceholder}
              rows={5}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              disabled={!canUpdate}
            />
            {canUpdate && (
              <div className={styles.notesActions}>
                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  loading={notesMutation.isPending}
                  disabled={(client.notes ?? "") === notes}
                  onClick={handleSaveNotes}
                >
                  {ru.clients.detail.saveNotes}
                </Button>
              </div>
            )}
          </div>
        </Card>

        <Card
          className={styles.spanFull}
          header={<CardTitle>{ru.clients.detail.orderHistory}</CardTitle>}
        >
          {!isLoadingOrders && orders.length === 0 ? (
            <EmptyState title={ru.clients.detail.noOrders} />
          ) : (
            <>
              <Table columns={orderColumns} data={orders} isLoading={isLoadingOrders} />
              {ordersTotal > ordersPageSize && (
                <Pagination
                  page={ordersPage}
                  pageSize={ordersPageSize}
                  total={ordersTotal}
                  onPageChange={updateOrdersPage}
                />
              )}
            </>
          )}
        </Card>
      </div>
    </>
  );
}
