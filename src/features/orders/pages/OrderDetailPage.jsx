import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Calendar,
  Hash,
  Package,
  CreditCard,
  ImageIcon,
} from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader/PageHeader";
import { Card, CardTitle } from "@/components/ui/Card/Card";
import { Button } from "@/components/ui/Button/Button";
import { Textarea } from "@/components/ui/Textarea/Textarea";
import { Badge } from "@/components/ui/Badge/Badge";
import { Spinner } from "@/components/ui/Spinner/Spinner";
import { Table } from "@/components/ui/Table/Table";
import { StatusBadge } from "@/components/shared/StatusBadge/StatusBadge";
import { StatsCard } from "@/components/shared/StatsCard/StatsCard";
import { ContactInfo } from "@/components/shared/ContactInfo/ContactInfo";
import { MoneyAmount } from "@/components/shared/MoneyAmount/MoneyAmount";
import { OrderStatusSelect } from "@/components/forms/OrderStatusSelect/OrderStatusSelect";
import { useOrder, useUpdateOrderStatus, useUpdateOrderNotes } from "@/features/orders/hooks/useOrders";
import { useToast } from "@/components/ui/Toast/Toast";
import { useCanUpdateOrders } from "@/features/auth/hooks/useAuth";
import {
  isFinalStatus,
  PAYMENT_METHOD_VARIANT,
  PAYMENT_METHOD_ICON,
} from "@/features/orders/constants";
import { formatDate, formatCurrency } from "@/lib/utils";
import { ru } from "@/locales/ru";
import styles from "./OrderDetailPage.module.css";

const API_ORIGIN = (() => {
  try {
    return new URL(import.meta.env.VITE_API_URL || "http://localhost:8000/api/v1").origin;
  } catch {
    return "http://localhost:8000";
  }
})();

const resolveImageUrl = (url) => {
  if (!url) return null;
  if (/^https?:\/\//i.test(url)) return url;
  return `${API_ORIGIN}${url}`;
};

const getAdminNotes = (order) =>
  order?.admin_notes ?? order?.adminNotes ?? order?.notes ?? "";

export function OrderDetailPage() {
  const { id } = useParams();
  const { data: order, isLoading } = useOrder(id);

  if (isLoading || !order) {
    return (
      <div className={styles.loading}>
        <Spinner size="lg" />
      </div>
    );
  }

  // Inner component keyed on order id — mounts fresh once data is ready,
  // useState initialized synchronously from prop (no async-load race).
  return <OrderDetailPageInner key={order.id} order={order} id={id} />;
}

function OrderDetailPageInner({ order, id }) {
  const navigate = useNavigate();
  const toast = useToast();
  const canUpdate = useCanUpdateOrders();

  const [newStatus, setNewStatus] = useState("");
  const [adminNotes, setAdminNotes] = useState(() => getAdminNotes(order));

  const statusMutation = useUpdateOrderStatus();
  const notesMutation = useUpdateOrderNotes();

  // Re-sync when the order refetches (e.g., after a mutation invalidates cache).
  useEffect(() => {
    setAdminNotes(getAdminNotes(order));
    setNewStatus("");
  }, [order]);

  const isFinal = isFinalStatus(order.status);
  const canChangeStatus = canUpdate && !isFinal;
  const hasStatusChange = Boolean(newStatus) && newStatus !== order.status;
  const hasNotesChange = getAdminNotes(order) !== adminNotes;
  const hasChanges = hasStatusChange || hasNotesChange;

  const handleSave = () => {
    if (hasStatusChange) {
      statusMutation.mutate(
        { id, status: newStatus, admin_notes: adminNotes || null },
        {
          onSuccess: () => {
            toast.success(ru.orders.toasts.statusUpdated);
            setNewStatus("");
          },
          onError: (err) => {
            const status = err?.response?.status;
            if (status === 422 || status === 400) {
              toast.error(ru.common.error, ru.orders.toasts.invalidTransition);
            } else {
              toast.error(ru.common.error, err?.response?.data?.detail || ru.orders.toasts.error);
            }
          },
        },
      );
    } else if (hasNotesChange) {
      notesMutation.mutate(
        { id, admin_notes: adminNotes || null },
        {
          onSuccess: () => toast.success(ru.orders.toasts.notesUpdated),
          onError: () => toast.error(ru.common.error, ru.orders.toasts.error),
        },
      );
    }
  };

  const itemColumns = [
    {
      id: "service",
      header: ru.orders.itemColumns.service,
      cell: ({ row }) => {
        const snap = row.original.service_snapshot ?? {};
        const src = resolveImageUrl(snap.image_url);
        return (
          <div className={styles.itemServiceCell}>
            {src ? (
              <img src={src} alt="" className={styles.itemThumb} />
            ) : (
              <span className={styles.itemThumbPlaceholder} aria-hidden="true">
                <ImageIcon size={14} />
              </span>
            )}
            <div className={styles.itemServiceInfo}>
              <span className={styles.itemServiceTitle}>{snap.title ?? "—"}</span>
              <span className={styles.itemServiceMeta}>
                {snap.platform ? `${snap.platform.toUpperCase()} · ` : ""}
                {snap.game_slug ?? ""}
              </span>
            </div>
          </div>
        );
      },
    },
    {
      id: "option",
      header: ru.orders.itemColumns.option,
      size: 140,
      cell: ({ row }) => row.original.option_label ?? "—",
    },
    {
      id: "quantity",
      header: ru.orders.itemColumns.quantity,
      size: 100,
      align: "center",
      cell: ({ row }) => row.original.quantity,
    },
    {
      id: "unit_price",
      header: ru.orders.itemColumns.unitPrice,
      size: 120,
      align: "right",
      cell: ({ row }) => (
        <MoneyAmount
          amountUsd={row.original.unit_price_usd}
          amountEur={row.original.unit_price_eur}
          displayCurrency={order.display_currency}
          size="sm"
        />
      ),
    },
    {
      id: "total",
      header: ru.orders.itemColumns.total,
      size: 120,
      align: "right",
      cell: ({ row }) => (
        <MoneyAmount
          amountUsd={row.original.total_price_usd}
          amountEur={row.original.total_price_eur}
          displayCurrency={order.display_currency}
          size="sm"
        />
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title={`${ru.orders.title.slice(0, 5)} ${order.order_number ?? ""}`}
        breadcrumb={[
          { label: ru.orders.title, to: "/orders" },
          { label: order.order_number ?? "" },
        ]}
        action={
          <Button
            type="button"
            variant="ghost"
            icon={<ArrowLeft size={16} />}
            onClick={() => navigate("/orders")}
          >
            {ru.orders.detail.backToList}
          </Button>
        }
      />

      <div className={styles.statsRow}>
        <StatsCard
          icon={<StatusBadge type="order" status={order.status} />}
          label={ru.orders.detail.currentStatus}
          value={ru.orders.status[order.status] ?? order.status}
        />
        <StatsCard
          icon={<Calendar size={20} />}
          label={ru.orders.detail.orderDate}
          value={formatDate(order.created_at)}
          color="info"
        />
        <StatsCard
          icon={<CreditCard size={20} />}
          label={ru.orders.detail.orderTotal}
          value={
            <MoneyAmount
              amountUsd={order.final_total_usd}
              displayCurrency={order.display_currency}
              size="lg"
            />
          }
          color="success"
        />
        <StatsCard
          icon={<Package size={20} />}
          label={ru.orders.detail.itemsCount}
          value={order.items_count ?? order.items?.length ?? 0}
        />
      </div>

      <div className={styles.grid}>
        <Card
          className={styles.spanFull}
          header={<CardTitle>{ru.orders.detail.customerInfo}</CardTitle>}
          footer={
            order.client?.id && (
              <Link to={`/clients/${order.client.id}`} className={styles.linkRight}>
                {ru.orders.detail.goToClient} →
              </Link>
            )
          }
        >
          <ContactInfo
            email={order.client?.email}
            discord={order.client?.discord}
            telegram={order.client?.telegram}
            whatsapp={order.client?.whatsapp}
          />
        </Card>

        <Card
          className={styles.spanFull}
          header={<CardTitle>{ru.orders.detail.items}</CardTitle>}
          footer={
            <div className={styles.totals}>
              <div className={styles.totalRow}>
                <span>{ru.orders.detail.subtotal}</span>
                <MoneyAmount
                  amountUsd={order.subtotal_usd}
                  displayCurrency={order.display_currency}
                />
              </div>
              {Number(order.discount_percent) > 0 && (
                <div className={styles.totalRow}>
                  <span>
                    {ru.orders.detail.discount} (-{order.discount_percent}%)
                  </span>
                  <span className={styles.discount}>
                    -{formatCurrency(order.discount_amount_usd, "USD")}
                  </span>
                </div>
              )}
              <div className={styles.totalRowFinal}>
                <span>{ru.orders.detail.total}</span>
                <MoneyAmount
                  amountUsd={order.final_total_usd}
                  displayCurrency={order.display_currency}
                  size="lg"
                />
              </div>
              <div className={styles.totalMeta}>
                <span>{ru.orders.detail.displayCurrency}:</span>
                <Badge variant="neutral">{order.display_currency}</Badge>
                <span>·</span>
                <Badge variant={PAYMENT_METHOD_VARIANT[order.payment_method] ?? "neutral"}>
                  <span className={styles.paymentBadgeInner}>
                    {(() => {
                      const Icon = PAYMENT_METHOD_ICON[order.payment_method];
                      return Icon ? <Icon size={12} aria-hidden="true" /> : null;
                    })()}
                    {ru.orders.paymentMethod[order.payment_method] ?? order.payment_method}
                  </span>
                </Badge>
              </div>
            </div>
          }
        >
          <Table columns={itemColumns} data={order.items ?? []} />
        </Card>

        <Card header={<CardTitle>{ru.orders.detail.management}</CardTitle>}>
          <div className={styles.fields}>
            <div>
              <span className={styles.fieldLabel}>{ru.orders.detail.currentStatus}</span>
              <div style={{ marginTop: "var(--space-2)" }}>
                <StatusBadge type="order" status={order.status} />
              </div>
            </div>

            <OrderStatusSelect
              label={ru.orders.detail.newStatus}
              currentStatus={order.status}
              value={newStatus}
              onChange={setNewStatus}
              disabled={!canChangeStatus}
            />

            <Textarea
              label={ru.orders.detail.adminNotes}
              placeholder={ru.orders.detail.adminNotesPlaceholder}
              rows={4}
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              disabled={!canUpdate}
            />

            {canUpdate && (
              <div className={styles.saveRow}>
                <Button
                  type="button"
                  variant="primary"
                  loading={statusMutation.isPending || notesMutation.isPending}
                  disabled={!hasChanges}
                  onClick={handleSave}
                >
                  {ru.orders.detail.save}
                </Button>
              </div>
            )}
          </div>
        </Card>

        {order.payment_provider && (
          <Card header={<CardTitle>{ru.orders.paymentSession}</CardTitle>}>
            <div className={styles.fields}>
              <div>
                <span className={styles.fieldLabel}>{ru.orders.paymentProvider}</span>
                <div className={styles.fieldValue}>{order.payment_provider}</div>
              </div>

              {order.payment_session_id && (
                <div>
                  <span className={styles.fieldLabel}>{ru.orders.paymentSessionId}</span>
                  <div className={styles.fieldValueMono}>{order.payment_session_id}</div>
                </div>
              )}

              {order.payment_checkout_url && (
                <div>
                  <span className={styles.fieldLabel}>{ru.orders.paymentCheckoutUrl}</span>
                  <div className={styles.fieldValue}>
                    <a
                      href={order.payment_checkout_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.externalLink}
                    >
                      {ru.orders.openCheckoutLink} ↗
                    </a>
                  </div>
                </div>
              )}

              {order.payment_status_updated_at && (
                <div>
                  <span className={styles.fieldLabel}>{ru.common.lastUpdated}</span>
                  <div className={styles.fieldValue}>
                    {formatDate(order.payment_status_updated_at)}
                  </div>
                </div>
              )}
            </div>
          </Card>
        )}

        <Card header={<CardTitle>{ru.orders.detail.customerComment}</CardTitle>}>
          <p className={order.comment ? styles.comment : styles.commentEmpty}>
            {order.comment || ru.orders.noComment}
          </p>
        </Card>
      </div>
    </>
  );
}
