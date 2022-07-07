CREATE OR REPLACE FUNCTION COMPARE_STRING_FILTER(INPUT IN STRING) RETURN VARCHAR2
    IS OUTPUT VARCHAR2(500);
BEGIN
        SELECT regexp_substr(INPUT, '[^,]+', 1, level) INTO OUTPUT
                                      from dual
                                      connect by regexp_substr(INPUT, '[^,]+', 1, level) is not null;
    RETURN OUTPUT;
end;

/
--EndMethod--

CREATE OR REPLACE FUNCTION "COMPONENT_CREATE_NEW" (
    class_name   IN   NVARCHAR2,
    style        IN   NVARCHAR2,
    view_type    IN   NVARCHAR2,
    view_id      IN   NUMBER,
    detail      IN NVARCHAR2
) RETURN NUMBER IS
    maxpriority   NUMBER;
    last_id       fw_home_component.id%TYPE;
BEGIN
    BEGIN
        SELECT
            MAX(priority)
        INTO maxpriority
        FROM
            fw_home_component;

    EXCEPTION
        WHEN no_data_found THEN
            maxpriority := 0;
    END;

    IF maxpriority IS NULL THEN
        maxpriority := 0;
    END IF;
    maxpriority := maxpriority + 1;
    INSERT INTO fw_home_component (
        class_name,
        style,
        view_type,
        view_id,
        detail,
        priority
    ) VALUES (
        class_name,
        style,
        view_type,
        view_id,
        detail,
        maxpriority
    ) RETURNING id INTO last_id;

    COMMIT;
    RETURN last_id;
END component_create_new;

/
--EndMethod--

CREATE OR REPLACE FUNCTION CONTACT_SEARCH_PAGE(page_number IN OUT NUMBER, page_size IN OUT NUMBER, read_state In NUMBER, search_term IN STRING, total_item OUT NUMBER, page_total OUT NUMBER) RETURN SYS_REFCURSOR
AS
    my_cursor SYS_REFCURSOR;
    sT STRING(502) := '%' || lower(search_term) || '%';
BEGIN
    SELECT COUNT(*)
    INTO total_item
    FROM FW_CONTACT
    WHERE (read_state = -1 OR read_state = READ) and (
        search_term = ''
        OR LOWER(NAME) LIKE sT
        OR LOWER(EMAIL) LIKE sT
        OR LOWER(SUBJECT) LIKE sT
        OR LOWER(MESSAGE) LIKE sT
    );

    IF page_number < 1 THEN page_number := 1; END IF;
    IF page_size < 1 THEN page_size := 1; END IF;
    page_total := CEIL(total_item / page_size);
    page_number := LEAST(page_number, page_total);

    OPEN my_cursor FOR
        SELECT *
        FROM (
            SELECT NAME                         AS  "name",
                   EMAIL                        AS  "email",
                   SUBJECT                      AS  "subject",
--                    MESSAGE                      AS  "message",
                   READ                         AS  "read",
                   CREATED_DATE                 AS  "createdDate",
                   ID                           AS  "id",
                   ROW_NUMBER() OVER (ORDER BY ID DESC) R
            FROM FW_CONTACT
            WHERE (read_state = -1 OR read_state = READ) and (
                search_term = ''
                OR LOWER(NAME) LIKE sT
                OR LOWER(EMAIL) LIKE sT
                OR LOWER(SUBJECT) LIKE sT
                OR LOWER(MESSAGE) LIKE sT
            )
        ) WHERE R BETWEEN (page_number - 1) * page_size + 1 AND  page_number * page_size;
    RETURN my_cursor;
END;

/
--EndMethod--

CREATE OR REPLACE function date_to_unix_ts( PDate in date ) return number is

   l_unix_ts number;

begin

   l_unix_ts := ( PDate - date '1970-01-01' ) * 60 * 60 * 24;
   return l_unix_ts;

end;

/
--EndMethod--

CREATE OR REPLACE FUNCTION DM_DON_VI_SEARCH_PAGE(pageNumber IN OUT NUMBER, pageSize IN OUT NUMBER, searchTerm IN STRING, totalItem OUT NUMBER, pageTotal OUT NUMBER) RETURN SYS_REFCURSOR
AS
    my_cursor SYS_REFCURSOR;
    sT STRING(502) := '%' || lower(searchTerm) || '%';
BEGIN
    SELECT COUNT(*)
    INTO totalItem
    FROM DM_DON_VI dv
        LEFT JOIN DM_LOAI_DON_VI ldv on dv.MA_PL = ldv.MA
    WHERE searchTerm = ''
       OR LOWER(TRIM(dv.TEN)) LIKE sT
       OR LOWER(TRIM(dv.TEN_TIENG_ANH)) LIKE ST;

    IF pageNumber < 1 THEN pageNumber := 1; END IF;
    IF pageSize < 1 THEN pageSize := 1; END IF;
    pageTotal := CEIL(totalItem / pageSize);
    pageNumber := LEAST(pageNumber, pageTotal);

    OPEN my_cursor FOR
        SELECT *
        FROM (
                SELECT dv.MA                        AS  "ma",
                    dv.TEN                          AS  "ten",
                    dv.TEN_TIENG_ANH                AS "tenTiengAnh",
                    dv.TEN_VIET_TAT                 AS "tenVietTat",
                    dv.QD_THANH_LAP AS "qdThanhLap",
                    dv.QD_XOA_TEN   AS "qdXoaTen",
                    dv.MA_PL        AS "maPl",
                    ldv.TEN AS "tenLoaiDonVi",
                    dv.GHI_CHU  AS "ghiChu",
                    dv.KICH_HOAT    AS "kichHoat",
                    dv.DUONG_DAN    AS "duongDan",
                    dv.IMAGE    AS "image",
                    dv.IMAGE_DISPLAY    AS "imageDisplay",
                    dv.IMAGE_DISPLAY_TA AS "imageDisplayTa",
                    dv.PRE_SHCC AS "preShcc",
                    ROW_NUMBER() OVER (ORDER BY MA_PL, dv.TEN) R
                FROM DM_DON_VI dv
                    LEFT JOIN DM_LOAI_DON_VI ldv on dv.MA_PL = ldv.MA
                WHERE searchTerm = ''
                   OR LOWER(TRIM(dv.TEN)) LIKE sT
                   OR LOWER(TRIM(dv.TEN_TIENG_ANH)) LIKE ST
             )
        WHERE R BETWEEN (pageNumber - 1) * pageSize + 1 AND  pageNumber * pageSize;
    RETURN my_cursor;
END;

/
--EndMethod--

CREATE OR REPLACE FUNCTION DM_KHOI_KIEN_THUC_SEARCH_PAGE(pageNumber IN OUT NUMBER, pageSize IN OUT NUMBER,
                                              searchTerm IN STRING,
                                              totalItem OUT NUMBER, pageTotal OUT NUMBER)
    RETURN SYS_REFCURSOR
AS
    my_cursor SYS_REFCURSOR;
    sT        STRING(500) := '%' || lower(searchTerm) || '%';
BEGIN
    SELECT COUNT(*)
    INTO totalItem
    FROM DM_KHOI_KIEN_THUC kienThuc
             LEFT JOIN DM_KHOI_KIEN_THUC kienThucCha ON kienThucCha.MA = kienThuc.KHOI_CHA
    WHERE searchTerm = ''
       OR lower(kienThuc.TEN) LIKE st
       OR lower(kienThucCha.TEN) LIKE st;

    IF pageNumber < 1 THEN pageNumber := 1; END IF;
    IF pageSize < 1 THEN pageSize := 1; END IF;
    pageTotal := CEIL(totalItem / pageSize);
    pageNumber := LEAST(pageNumber, pageTotal);

    OPEN my_cursor FOR
        SELECT *
        FROM (
                 SELECT kienThuc.MA       as                     "ma",
                        kienThuc.TEN      as                     "ten",
                        kienThuc.KHOI_CHA as                     "khoiCha",
                        kienThucCha.TEN   as                     "tenKhoiCha",
                        ROW_NUMBER() OVER (ORDER BY kienThuc.MA) R
                 FROM DM_KHOI_KIEN_THUC kienThuc
                          LEFT JOIN DM_KHOI_KIEN_THUC kienThucCha ON kienThucCha.MA = kienThuc.KHOI_CHA
                 WHERE searchTerm = ''
                    OR lower(kienThuc.TEN) LIKE st
                    OR lower(kienThucCha.TEN) LIKE st
             )
        WHERE R BETWEEN (pageNumber - 1) * pageSize + 1 AND pageNumber * pageSize;
    RETURN my_cursor;
END;

/
--EndMethod--

CREATE OR REPLACE FUNCTION DM_LINH_VUC_KINH_DOANH_SEARCH_PAGE(pageNumber IN OUT NUMBER, pageSize IN OUT NUMBER, searchTerm IN STRING, totalItem OUT NUMBER, pageTotal OUT NUMBER) RETURN SYS_REFCURSOR
AS
    my_cursor SYS_REFCURSOR;
    sT STRING(502) := '%' || lower(searchTerm) || '%';
BEGIN
    SELECT COUNT(*)
    INTO totalItem
    FROM DM_LINH_VUC_KINH_DOANH LV
    WHERE searchTerm = ''
       OR LOWER(TRIM(TEN)) LIKE sT;

    IF pageNumber < 1 THEN pageNumber := 1; END IF;
    IF pageSize < 1 THEN pageSize := 1; END IF;
    pageTotal := CEIL(totalItem / pageSize);
    pageNumber := LEAST(pageNumber, pageTotal);

    OPEN my_cursor FOR
        SELECT *
        FROM (
                SELECT LV.MA                        AS  "ma",
                    LV.TEN                          AS  "ten",
                    LV.MO_TA                        AS  "moTa",
                    LV.KICH_HOAT                    AS  "kichHoat",
                    ROW_NUMBER() OVER (ORDER BY MA DESC) R
                FROM DM_LINH_VUC_KINH_DOANH LV
                WHERE searchTerm = ''
                    OR LOWER(TRIM(TEN)) LIKE sT
             )
        WHERE R BETWEEN (pageNumber - 1) * pageSize + 1 AND  pageNumber * pageSize;
    RETURN my_cursor;
END;

/
--EndMethod--

CREATE OR REPLACE FUNCTION DM_SV_TO_HOP_TS_SEARCH_PAGE(pageNumber IN OUT NUMBER, pageSize IN OUT NUMBER, searchTerm IN STRING,
                                            totalItem OUT NUMBER, pageTotal OUT NUMBER) RETURN SYS_REFCURSOR
AS
    my_cursor SYS_REFCURSOR;
    sT        STRING(502) := '%' || lower(searchTerm) || '%';
BEGIN
    SELECT COUNT(*)
    INTO totalItem
    FROM DM_SV_TO_HOP_TS THTS
             LEFT JOIN DM_SV_MON_THI DMMT_1 ON DMMT_1.ID = THTS.MON_1
             LEFT JOIN DM_SV_MON_THI DMMT_2 ON DMMT_2.ID = THTS.MON_2
             LEFT JOIN DM_SV_MON_THI DMMT_3 ON DMMT_3.ID = THTS.MON_3

    WHERE searchTerm = ''
       OR LOWER(TRIM(DMMT_1.TEN)) LIKE sT
       OR LOWER(TRIM(DMMT_2.TEN)) LIKE sT
       OR LOWER(TRIM(DMMT_3.TEN)) LIKE sT
       OR LOWER(TRIM(THTS.GHI_CHU)) LIKE sT
       OR LOWER(TRIM(THTS.MA_TO_HOP)) LIKE sT;

    IF pageNumber < 1 THEN pageNumber := 1; END IF;
    IF pageSize < 1 THEN pageSize := 1; END IF;
    pageTotal := CEIL(totalItem / pageSize);
    pageNumber := LEAST(pageNumber, pageTotal);

    OPEN my_cursor FOR
        SELECT *
        FROM (SELECT THTS.MA_TO_HOP AS                           "maToHop",
                     DMMT_1.TEN     AS                           "tenMon1",
                     DMMT_2.TEN     AS                           "tenMon2",
                     DMMT_3.TEN     AS                           "tenMon3",
                     THTS.MON_1     AS                           "mon1",
                     THTS.MON_2     AS                           "mon2",
                     THTS.MON_3     AS                           "mon3",
                     THTS.GHI_CHU   AS                           "ghiChu",
                     THTS.KICH_HOAT AS                           "kichHoat",
                     ROW_NUMBER() OVER (ORDER BY THTS.MA_TO_HOP) R
              FROM DM_SV_TO_HOP_TS THTS
                       LEFT JOIN DM_SV_MON_THI DMMT_1 ON DMMT_1.ID = THTS.MON_1
                       LEFT JOIN DM_SV_MON_THI DMMT_2 ON DMMT_2.ID = THTS.MON_2
                       LEFT JOIN DM_SV_MON_THI DMMT_3 ON DMMT_3.ID = THTS.MON_3

              WHERE searchTerm = ''
                 OR LOWER(TRIM(DMMT_1.TEN)) LIKE sT
                 OR LOWER(TRIM(DMMT_2.TEN)) LIKE sT
                 OR LOWER(TRIM(DMMT_3.TEN)) LIKE sT
                 OR LOWER(TRIM(THTS.GHI_CHU)) LIKE sT
                 OR LOWER(TRIM(THTS.MA_TO_HOP)) LIKE sT
              ORDER BY MA_TO_HOP)
        WHERE R BETWEEN (pageNumber - 1) * pageSize + 1 AND pageNumber * pageSize;
    RETURN my_cursor;
END;

/
--EndMethod--

CREATE OR REPLACE FUNCTION DN_DOANH_NGHIEP_SEARCH_ALL(loaiDoanhNghiep IN NUMBER, kichHoat IN NUMBER, searchTerm IN STRING) RETURN SYS_REFCURSOR
AS
    my_cursor SYS_REFCURSOR;
    sT        STRING(502) := '%' || lower(searchTerm) || '%';
BEGIN
    OPEN my_cursor FOR
        SELECT *
        FROM (
                 SELECT DN.ID                  AS            "id",
                        DN.HIDDEN_SHORT_NAME   AS            "hiddenShortName",
                        DN.DOI_TAC             AS            "doiTac",
                        DN.IMAGE               AS            "image",
                        DN.QUOC_GIA            AS            "quocGia",
                        DN.TEN_DAY_DU          AS            "tenDayDu",
                        DN.TEN_VIET_TAT        AS            "tenVietTat"
                 FROM DN_DOANH_NGHIEP DN
                     LEFT JOIN DM_QUOC_GIA QG ON DN.QUOC_GIA = QG.MA_CODE
                     LEFT JOIN DN_LOAI_DOANH_NGHIEP DM ON DM.DOANH_NGHIEP = DN.ID
                 WHERE (loaiDoanhNghiep IS NULL OR DM.LOAI = loaiDoanhNghiep) AND (kichHoat IS NULL OR KICH_HOAT_TRANG_TRUONG = kichHoat) AND (searchTerm = ''
                    OR LOWER(TRIM(TEN_DAY_DU)) LIKE sT
                    OR LOWER(TRIM(TEN_VIET_TAT)) LIKE sT
                    OR LOWER(NAM_THANH_LAP) LIKE sT
                    OR LOWER(QG.TEN_QUOC_GIA) LIKE sT)
             );
    RETURN my_cursor;
END;

/
--EndMethod--

CREATE OR REPLACE FUNCTION DN_DOANH_NGHIEP_SEARCH_PAGE(pageNumber IN OUT NUMBER, pageSize IN OUT NUMBER, searchTerm IN STRING,
                                            maDonVi IN STRING, totalItem OUT NUMBER,
                                            pageTotal OUT NUMBER) RETURN SYS_REFCURSOR
AS
    my_cursor SYS_REFCURSOR;
    sT        STRING(502) := '%' || lower(searchTerm) || '%';
BEGIN
    SELECT COUNT(*)
    INTO totalItem
    FROM DN_DOANH_NGHIEP DN
             LEFT JOIN DM_QUOC_GIA QG ON DN.QUOC_GIA = QG.MA_CODE
    WHERE (maDonVi IS NULL OR maDonVi = '' OR maDonVi = DN.DON_VI_PHU_TRACH)
      AND (
                searchTerm = ''
            OR LOWER(TRIM(TEN_DAY_DU)) LIKE sT
            OR LOWER(TRIM(TEN_VIET_TAT)) LIKE sT
            OR LOWER(NAM_THANH_LAP) LIKE sT
            OR LOWER(QG.TEN_QUOC_GIA) LIKE sT
        );

    IF pageNumber < 1 THEN pageNumber := 1; END IF;
    IF pageSize < 1 THEN pageSize := 1; END IF;
    pageTotal := CEIL(totalItem / pageSize);
    pageNumber := LEAST(pageNumber, pageTotal);

    OPEN my_cursor FOR
        SELECT *
        FROM (
                 SELECT DN.ID                     AS            "id",
                        DN.QUOC_GIA               AS            "quocGia",
                        DN.TEN_DAY_DU             AS            "tenDayDu",
                        DN.TEN_VIET_TAT           AS            "tenVietTat",
                        DN.MO_TA                  AS            "moTa",
                        DN.KICH_HOAT              AS            "kichHoat",
                        DN.KICH_HOAT_TRANG_TRUONG AS            "kichHoatTrangTruong",
                        DN.DOI_TAC                AS            "doiTac",
                        DN.NAM_THANH_LAP          AS            "namThanhLap",
                        QG.TEN_QUOC_GIA           AS            "tenQuocGia",
                        DN.IMAGE                  AS            "image",
                        DV.TEN                    AS            "tenDonViPhuTrach",
                        ROW_NUMBER() OVER (ORDER BY DN.ID DESC) R
                 FROM DN_DOANH_NGHIEP DN
                          LEFT JOIN DM_QUOC_GIA QG ON DN.QUOC_GIA = QG.MA_CODE
                          LEFT JOIN DM_DON_VI DV ON DN.DON_VI_PHU_TRACH = DV.MA
                 WHERE (maDonVi IS NULL OR maDonVi = '' OR maDonVi = DN.DON_VI_PHU_TRACH)
                   AND (
                             searchTerm = ''
                         OR LOWER(TRIM(TEN_DAY_DU)) LIKE sT
                         OR LOWER(TRIM(DN.TEN_VIET_TAT)) LIKE sT
                         OR LOWER(NAM_THANH_LAP) LIKE sT
                         OR LOWER(QG.TEN_QUOC_GIA) LIKE sT
                     )
             )
        WHERE R BETWEEN (pageNumber - 1) * pageSize + 1 AND pageNumber * pageSize;
    RETURN my_cursor;
END;

/
--EndMethod--

CREATE OR REPLACE FUNCTION DOWNLOAD_EXCEL_QT_HOP_DONG_LAO_DONG(pageNumber IN OUT NUMBER, pageSize IN OUT NUMBER,
                                                    searchTerm IN STRING, totalItem OUT NUMBER,
                                                    pageTotal OUT NUMBER) RETURN SYS_REFCURSOR
AS
    my_cursor SYS_REFCURSOR;
    sT        STRING(502) := '%' || lower(searchTerm) || '%';
BEGIN
    SELECT COUNT(*)
    INTO totalItem
    FROM QT_HOP_DONG_LAO_DONG HD
             LEFT JOIN TCHC_CAN_BO cb ON HD.NGUOI_DUOC_THUE = cb.SHCC
    WHERE HD.NGUOI_DUOC_THUE IN (
        SELECT tcb.SHCC
        FROM TCHC_CAN_BO tcb
        WHERE (
                          searchTerm = '' OR tcb.SHCC LIKE sT OR LOWER(TRIM(tcb.ho || ' ' || tcb.ten)) LIKE sT
                  )
    );
    IF pageNumber < 1 THEN pageNumber := 1; END IF;
    IF pageSize < 1 THEN pageSize := 1; END IF;
    pageTotal := CEIL(totalItem / pageSize);
    pageNumber := LEAST(pageNumber, pageTotal);
    OPEN my_cursor FOR
        SELECT *
        FROM (
                 SELECT CBK.HO                  AS                                               "hoNguoiKy",
                        CBK.TEN                 AS                                               "tenNguoiKy",
                        CBK.MA_CHUC_VU          AS                                               "maChucVuNguoiKy",
                        CV.TEN                  AS                                               "chucVuNguoiKy",
                        DVK.TEN                 AS                                               "donViNguoiKy",
                        HD.NGUOI_DUOC_THUE      AS                                               "shcc",
                        HD.SO_HOP_DONG          AS                                               "soHopDong",
                        CB.HO                   AS                                               "ho",
                        CB.TEN                  AS                                               "ten",
                        CB.CMND                 AS                                               "cmnd",
                        CB.CMND_NGAY_CAP        AS                                               "ngayCap",
                        CB.CMND_NOI_CAP         AS                                               "noiCap",
                        CB.PHAI                 AS                                               "phai",
                        GTinh.TEN               AS                                               "gioiTinh",
                        CB.DIEN_THOAI_CA_NHAN   AS                                               "dienThoai",
                        CB.EMAIL                AS                                               "email",
                        CB.NGAY_SINH            AS                                               "ngaySinh",
                        TP1.TEN                 AS                                               "noiSinh",
                        TP2.TEN                 AS                                               "nguyenQuan",
                        TP3.TEN                 AS                                               "tinhCuTru",
                        TP4.TEN                 AS                                               "tinhThuongTru",
                        QH1.TEN_QUAN_HUYEN      AS                                               "huyenCuTru",
                        QH2.TEN_QUAN_HUYEN      AS                                               "huyenThuongTru",
                        PX1.TEN_PHUONG_XA       AS                                               "xaCuTru",
                        PX2.TEN_PHUONG_XA       AS                                               "xaThuongTru",
                        CB.HIEN_TAI_SO_NHA      AS                                               "soNhaCuTru",
                        CB.THUONG_TRU_SO_NHA    AS                                               "soNhaThuongTru",
                        TDHV.TEN                AS                                               "trinhDoHocVan",
                        CB.CHUYEN_NGANH         AS                                               "hocVanChuyenNganh",
                        DT.TEN                  AS                                               "danToc",
                        TG.TEN                  AS                                               "tonGiao",
                        QT.TEN_QUOC_GIA         AS                                               "quocTich",
                        LHD.TEN                 AS                                               "loaiHopDong",
                        HD.NGAY_KY_HOP_DONG     AS                                               "ngayKyHopDong",
                        HD.BAT_DAU_LAM_VIEC     AS                                               "batDauLamViec",
                        HD.NGAY_KY_HD_TIEP_THEO AS                                               "ngayKyHdTiepTheo",
                        HD.KET_THUC_HOP_DONG    AS                                               "ketThucHopDong",
                        DV3.TEN                 AS                                               "diaDiemLamViec",
                        CDCM.TEN                AS                                               "chucDanhChuyenMon",
                        HD.CHIU_SU_PHAN_CONG    AS                                               "chiuSuPhanCong",
                        ngach.TEN               AS                                               "ngach",
                        HD.BAC                  AS                                               "bac",
                        HD.HE_SO                AS                                               "heSo",
                        HD.PHAN_TRAM_HUONG      AS                                               "phanTramHuong",

                        ROW_NUMBER() OVER (ORDER BY CB.TEN ASC,CB.HO ASC,HD.NGUOI_DUOC_THUE ASC) R
                 FROM QT_HOP_DONG_LAO_DONG HD
                          LEFT JOIN TCHC_CAN_BO CB ON HD.NGUOI_DUOC_THUE = CB.SHCC
                          LEFT JOIN DM_LOAI_HOP_DONG LHD ON HD.LOAI_HOP_DONG = LHD.MA
                          LEFT JOIN DM_DAN_TOC DT ON CB.DAN_TOC = DT.MA
                          LEFT JOIN DM_TON_GIAO TG ON CB.TON_GIAO = TG.MA
                          LEFT JOIN DM_GIOI_TINH GTinh ON CB.PHAI = GTinh.MA
                          LEFT JOIN DM_QUOC_GIA QT ON CB.QUOC_GIA = QT.MA_CODE
                          LEFT JOIN DM_NGACH_CDNN ngach ON HD.NGACH = ngach.ID
                          LEFT JOIN DM_TRINH_DO TDHV ON CB.TRINH_DO_PHO_THONG = TDHV.MA
                          LEFT JOIN DM_TINH_THANH_PHO TP1 ON CB.MA_TINH_NOI_SINH = TP1.MA
                          LEFT JOIN DM_TINH_THANH_PHO TP2 ON CB.MA_TINH_NGUYEN_QUAN = TP2.MA
                          LEFT JOIN TCHC_CAN_BO CBK ON HD.NGUOI_KY = CBK.SHCC
                          LEFT JOIN DM_CHUC_VU CV ON CBK.MA_CHUC_VU = CV.MA
                          LEFT JOIN DM_DON_VI DVK ON CBK.MA_DON_VI = DVK.MA
                          LEFT JOIN DM_DON_VI DV2 ON CBK.MA_DON_VI = DV2.MA
                          LEFT JOIN DM_DON_VI DV3 ON HD.DIA_DIEM_LAM_VIEC = DV3.MA
                          LEFT JOIN DM_CHUC_DANH_KHOA_HOC CDKH ON CB.CHUC_DANH = CDKH.MA
                          LEFT JOIN DM_CHUC_DANH_CHUYEN_MON CDCM ON HD.CHUC_DANH_CHUYEN_MON = CDCM.MA
                          LEFT JOIN DM_TINH_THANH_PHO TP3 ON CB.HIEN_TAI_MA_TINH = TP3.MA
                          LEFT JOIN DM_QUAN_HUYEN QH1
                                    ON CB.HIEN_TAI_MA_HUYEN = QH1.MA_TINH_THANH_PHO AND
                                       CB.HIEN_TAI_MA_HUYEN = QH1.MA_QUAN_HUYEN
                          LEFT JOIN DM_PHUONG_XA PX1
                                    ON CB.HIEN_TAI_MA_HUYEN = PX1.MA_QUAN_HUYEN AND CB.HIEN_TAI_MA_XA = PX1.MA_PHUONG_XA
                          LEFT JOIN DM_TINH_THANH_PHO TP4 ON CB.THUONG_TRU_MA_TINH = TP4.MA
                          LEFT JOIN DM_QUAN_HUYEN QH2 ON CB.THUONG_TRU_MA_TINH = QH2.MA_TINH_THANH_PHO AND
                                                         CB.THUONG_TRU_MA_HUYEN = QH2.MA_QUAN_HUYEN
                          LEFT JOIN DM_PHUONG_XA PX2
                                    ON CB.THUONG_TRU_MA_HUYEN = PX2.MA_QUAN_HUYEN AND
                                       CB.THUONG_TRU_MA_XA = PX2.MA_PHUONG_XA
                 WHERE HD.NGUOI_DUOC_THUE IN (
                     SELECT tcb.SHCC
                     FROM TCHC_CAN_BO tcb
                     WHERE (
                                       searchTerm = '' OR tcb.SHCC LIKE sT OR
                                       LOWER(TRIM(tcb.ho || ' ' || tcb.ten)) LIKE sT
                               )
                 )
                 ORDER BY CB.TEN ASC, CB.HO ASC, HD.NGUOI_DUOC_THUE ASC
             )
        WHERE R BETWEEN (pageNumber - 1) * pageSize + 1 AND pageNumber * pageSize;
    RETURN my_cursor;
END;

/
--EndMethod--

CREATE OR REPLACE FUNCTION DOWNLOAD_HOP_DONG_DVTL_TN(maHd IN NUMBER) RETURN SYS_REFCURSOR
AS
    HOP_DONG SYS_REFCURSOR;
BEGIN
    OPEN HOP_DONG FOR
        SELECT CBK.HO                   AS "hoNguoiKy",
               HD.SO_HOP_DONG           AS "soHopDong",
               CBK.TEN                  AS "tenNguoiKy",
               CBK.MA_CHUC_VU           AS "maChucVuNguoiKy",
               DV2.TEN                  AS "donViNguoiKy",
               CV.TEN                   AS "chucVuNguoiKy",
               HD.NGUOI_DUOC_THUE       AS "shcc",
               CB.HO                    AS "ho",
               CB.TEN                   AS "ten",
               CB.CMND                  AS "cmnd",
               CB.CMND_NGAY_CAP         AS "ngayCap",
               CB.CMND_NOI_CAP          AS "cmndNoiCap",
               CB.GIOI_TINH             AS "phai",
               CB.DIEN_THOAI            AS "dienThoai",
               CB.EMAIL                 AS "email",
               CB.NGAY_SINH             AS "ngaySinh",
               TP1.TEN                  AS "noiSinh",
               TP2.TEN                  AS "nguyenQuan",
               TP3.TEN                  AS "tinhCuTru",
               TP4.TEN                  AS "tinhThuongTru",
               QH1.TEN_QUAN_HUYEN       AS "huyenCuTru",
               QH2.TEN_QUAN_HUYEN       AS "huyenThuongTru",
               PX1.TEN_PHUONG_XA        AS "xaCuTru",
               PX2.TEN_PHUONG_XA        AS "xaThuongTru",
               CB.CU_TRU_SO_NHA         AS "soNhaCuTru",
               CB.THUONG_TRU_SO_NHA     AS "thuongTruSoNha",
               TDHV.TEN                 AS "trinhDoHocVan",
               CDKH.TEN                 AS "chucDanhKhoaHoc",
               CB.KHOA_HOC_CHUYEN_NGANH AS "khoaHocChuyenNganh",
               CB.HOC_VAN_CHUYEN_NGANH  AS "hocVanChuyenNganh",
               DT.TEN                   AS "danToc",
               TG.TEN                   AS "tonGiao",
               QT.TEN_QUOC_GIA          AS "quocTich",

               LHD.TEN                  AS "loaiHopDong",
               HD.HIEU_LUC_HOP_DONG     AS "hieuLucHopDong",
               HD.NGAY_KY_HOP_DONG      AS "ngayKyHopDong",
               HD.KET_THUC_HOP_DONG     AS "ketThucHopDong",
               DV3.TEN                  AS "diaDiemLamViec",
               CDCM.TEN                 AS "chucDanhChuyenMon",
               HD.CHIU_SU_PHAN_CONG     AS "chiuSuPhanCong",
               NG.TEN                 AS "ngach",
               HD.BAC                   AS "bac",
               HD.HE_SO                 AS "heSo",
               HD.TIEN_LUONG            AS "tienLuong",
               DV.TEN                   AS "donViChiTra"

        FROM QT_HOP_DONG_DVTL_TN HD
                 LEFT JOIN TCHC_CAN_BO_HOP_DONG_DVTL_TN CB ON HD.NGUOI_DUOC_THUE = CB.SHCC
                 LEFT JOIN DM_LOAI_HOP_DONG LHD ON HD.LOAI_HOP_DONG = LHD.MA
                 LEFT JOIN DM_DAN_TOC DT ON CB.DAN_TOC = DT.MA
                 LEFT JOIN DM_TON_GIAO TG ON CB.TON_GIAO = TG.MA
                 LEFT JOIN DM_QUOC_GIA QT ON CB.QUOC_GIA = QT.MA_CODE
                 LEFT JOIN DM_DON_VI DV ON HD.DON_VI_CHI_TRA = DV.MA

                 LEFT JOIN DM_NGACH_CDNN NG ON HD.NGACH = NG.ID
                 LEFT JOIN DM_TRINH_DO TDHV ON CB.HOC_VAN_TRINH_DO = TDHV.MA
                 LEFT JOIN DM_TINH_THANH_PHO TP1 ON CB.NOI_SINH_MA_TINH = TP1.MA
                 LEFT JOIN DM_TINH_THANH_PHO TP2 ON CB.NGUYEN_QUAN_MA_TINH = TP2.MA
                 LEFT JOIN TCHC_CAN_BO CBK ON HD.NGUOI_KY = CBK.SHCC
                 LEFT JOIN DM_CHUC_VU CV ON CBK.MA_CHUC_VU = CV.MA
                 LEFT JOIN DM_DON_VI DV2 ON CBK.MA_DON_VI = DV2.MA
                 LEFT JOIN DM_DON_VI DV3 ON HD.DIA_DIEM_LAM_VIEC = DV3.MA
                 LEFT JOIN DM_CHUC_DANH_KHOA_HOC CDKH ON CB.KHOA_HOC_CHUC_DANH = CDKH.MA
                 LEFT JOIN DM_CHUC_DANH_CHUYEN_MON CDCM ON HD.CHUC_DANH_CHUYEN_MON = CDCM.MA
                 LEFT JOIN DM_TINH_THANH_PHO TP3 ON CB.CU_TRU_MA_TINH = TP3.MA
                 LEFT JOIN DM_QUAN_HUYEN QH1
                           ON CB.CU_TRU_MA_TINH = QH1.MA_TINH_THANH_PHO AND CB.CU_TRU_MA_HUYEN = QH1.MA_QUAN_HUYEN
                 LEFT JOIN DM_PHUONG_XA PX1
                           ON CB.CU_TRU_MA_HUYEN = PX1.MA_QUAN_HUYEN AND CB.CU_TRU_MA_XA = PX1.MA_PHUONG_XA
                 LEFT JOIN DM_TINH_THANH_PHO TP4 ON CB.THUONG_TRU_MA_TINH = TP4.MA
                 LEFT JOIN DM_QUAN_HUYEN QH2 ON CB.THUONG_TRU_MA_TINH = QH2.MA_TINH_THANH_PHO AND
                                                CB.THUONG_TRU_MA_HUYEN = QH2.MA_QUAN_HUYEN
                 LEFT JOIN DM_PHUONG_XA PX2
                           ON CB.THUONG_TRU_MA_HUYEN = PX2.MA_QUAN_HUYEN AND CB.THUONG_TRU_MA_XA = PX2.MA_PHUONG_XA
        WHERE HD.MA = maHd;
    RETURN HOP_DONG;
END;

/
--EndMethod--

CREATE OR REPLACE FUNCTION DOWNLOAD_HOP_DONG_LAO_DONG(maHd IN NUMBER) RETURN SYS_REFCURSOR
AS
    HOP_DONG SYS_REFCURSOR;
BEGIN
    OPEN HOP_DONG FOR
        SELECT CBK.HO                AS "hoNguoiKy",
               CBK.TEN               AS "tenNguoiKy",
               CBK.PHAI              AS "gioiTinh",
               QG1.TEN_QUOC_GIA      AS "quocTichKy",
               (CASE
                    WHEN CBK.PHAI IS NOT NULL THEN
                        CASE
                            WHEN CBK.PHAI LIKE '01' THEN 'Ông'
                            ELSE 'Bà'
                            END
                    ELSE ''
                   END)              AS "phaiNK",
--                CBK.MA_CHUC_VU        AS "maChucVuNguoiKy",
               (Select TEN FROM QT_CHUC_VU qtcv
                          LEFT JOIN DM_CHUC_VU dmcv ON qtcv.MA_CHUC_VU = dmcv.MA
                           where qtcv.SHCC = CBK.SHCC AND qtcv.CHUC_VU_CHINH = 1) AS "chucVuNguoiKy",
--                DMCV.TEN              AS "chucVuNguoiKy",
                (Select MA_CHUC_VU FROM QT_CHUC_VU qtcv
                           where qtcv.SHCC = CBK.SHCC AND qtcv.CHUC_VU_CHINH = 1) AS "maChucVuNguoiKy",
                (Select TEN FROM QT_CHUC_VU qtcv
                            LEFT JOIN DM_DON_VI dmdv ON qtcv.MA_DON_VI = dmdv.MA
                           where qtcv.SHCC = CBK.SHCC AND qtcv.CHUC_VU_CHINH = 1) AS "donViNguoiKy",
--                DVK.TEN               AS "donViNguoiKy",
               HD.NGUOI_DUOC_THUE    AS "shcc",
               (CASE
                    WHEN CB.PHAI IS NOT NULL THEN
                        CASE
                            WHEN CB.PHAI = '01' THEN 'Ông'
                            ELSE 'Bà'
                            END
                    ELSE ''
                   END)              AS "phai",
               HD.SO_HOP_DONG        AS "soHopDong",
               CB.HO                 AS "ho",
               CB.TEN                AS "ten",
               CB.CMND               AS "cmnd",
               CB.CMND_NGAY_CAP      AS "ngayCap",
               CB.CMND_NOI_CAP       AS "cmndNoiCap",
               CB.PHAI               AS "phai",
               CB.DIEN_THOAI_CA_NHAN AS "dienThoai",
               CB.EMAIL              AS "email",
               CB.NGAY_SINH          AS "ngaySinh",
               TP1.TEN               AS "noiSinh",
               TP2.TEN               AS "nguyenQuan",
               TP3.TEN               AS "tinhCuTru",
               TP4.TEN               AS "tinhThuongTru",
               QH1.TEN_QUAN_HUYEN    AS "huyenCuTru",
               QH2.TEN_QUAN_HUYEN    AS "huyenThuongTru",
               PX1.TEN_PHUONG_XA     AS "xaCuTru",
               PX2.TEN_PHUONG_XA     AS "xaThuongTru",
               CB.HIEN_TAI_SO_NHA    AS "soNhaCuTru",
               CB.THUONG_TRU_SO_NHA  AS "soNhaThuongTru",
               TDHV.TEN              AS "trinhDoHocVan",
               CB.CHUYEN_NGANH       AS "hocVanChuyenNganh",
               DT.TEN                AS "danToc",
               TG.TEN                AS "tonGiao",
               QT.TEN_QUOC_GIA       AS "quocTich",
               LHD.TEN               AS "loaiHopDong",
               HD.BAT_DAU_LAM_VIEC   AS "batDauHopDong",
               HD.NGAY_KY_HOP_DONG   AS "ngayKyHopDong",
               HD.KET_THUC_HOP_DONG  AS "ketThucHopDong",
               DV3.TEN               AS "diaDiemLamViec",
               HD.CHIU_SU_PHAN_CONG  AS "chiuSuPhanCong",
               CDCM.TEN              AS "chucDanhChuyenMon",
               HD.BAC                AS "bac",
               HD.HE_SO              AS "heSo",
               HD.PHAN_TRAM_HUONG    AS "phanTramHuong"

        FROM QT_HOP_DONG_LAO_DONG HD
                 LEFT JOIN TCHC_CAN_BO CB ON HD.NGUOI_DUOC_THUE = CB.SHCC
                 LEFT JOIN DM_LOAI_HOP_DONG LHD ON HD.LOAI_HOP_DONG = LHD.MA
                 LEFT JOIN DM_DAN_TOC DT ON CB.DAN_TOC = DT.MA
                 LEFT JOIN DM_TON_GIAO TG ON CB.TON_GIAO = TG.MA
                 LEFT JOIN DM_QUOC_GIA QG1 ON CB.QUOC_GIA = QG1.MA_CODE
                 LEFT JOIN DM_QUOC_GIA QT ON CB.QUOC_GIA = QT.MA_CODE
                 LEFT JOIN DM_TRINH_DO TDHV ON CB.HOC_VI = TDHV.MA
                 LEFT JOIN DM_TINH_THANH_PHO TP1 ON CB.MA_TINH_NOI_SINH = TP1.MA
                 LEFT JOIN DM_TINH_THANH_PHO TP2 ON CB.MA_TINH_NGUYEN_QUAN = TP2.MA
                 LEFT JOIN TCHC_CAN_BO CBK ON HD.NGUOI_KY = CBK.SHCC
                 LEFT JOIN QT_CHUC_VU CV ON CBK.SHCC = CV.SHCC AND CV.CHUC_VU_CHINH = 1
                 LEFT JOIN DM_DON_VI DVK ON CBK.MA_DON_VI = DVK.MA
                 LEFT JOIN DM_DON_VI DV3 ON HD.DIA_DIEM_LAM_VIEC = DV3.MA
                 LEFT JOIN DM_TRINH_DO CDKH ON CB.HOC_VI = CDKH.MA
                 LEFT JOIN DM_NGACH_CDNN CDCM ON HD.MA_NGACH = CDCM.MA
                 LEFT JOIN DM_TINH_THANH_PHO TP3 ON CB.HIEN_TAI_MA_TINH = TP3.MA
                 LEFT JOIN DM_QUAN_HUYEN QH1
                           ON CB.HIEN_TAI_MA_TINH = QH1.MA_TINH_THANH_PHO AND CB.HIEN_TAI_MA_HUYEN = QH1.MA_QUAN_HUYEN
                 LEFT JOIN DM_PHUONG_XA PX1
                           ON CB.HIEN_TAI_MA_HUYEN = PX1.MA_QUAN_HUYEN AND CB.HIEN_TAI_MA_XA = PX1.MA_PHUONG_XA
                 LEFT JOIN DM_TINH_THANH_PHO TP4 ON CB.THUONG_TRU_MA_TINH = TP4.MA
                 LEFT JOIN DM_QUAN_HUYEN QH2 ON CB.THUONG_TRU_MA_TINH = QH2.MA_TINH_THANH_PHO AND
                                                CB.THUONG_TRU_MA_HUYEN = QH2.MA_QUAN_HUYEN
                 LEFT JOIN DM_PHUONG_XA PX2
                           ON CB.THUONG_TRU_MA_HUYEN = PX2.MA_QUAN_HUYEN AND CB.THUONG_TRU_MA_XA = PX2.MA_PHUONG_XA
        WHERE HD.MA = maHd;
    RETURN HOP_DONG;
END;

/
--EndMethod--

CREATE OR REPLACE FUNCTION DT_CALENDAR(room IN STRING, idNam IN NUMBER, hocKy IN NUMBER) RETURN SYS_REFCURSOR
AS
    my_cursor SYS_REFCURSOR;
BEGIN
    OPEN my_cursor FOR
        SELECT *
        FROM (SELECT TKB.MA_MON_HOC            AS "maMonHoc",
                     TKB.TIET_BAT_DAU          AS "tietBatDau",
                     TKB.NGAY_BAT_DAU          AS "ngayBatDau",
                     TKB.NGAY_KET_THUC         AS "ngayKetThuc",
                     TKB.SO_TIET_BUOI          AS "soTiet",
                     TKB.GIANG_VIEN            AS "giangVien",
                     TKB.NHOM                  AS "nhom",
                     TKB.THU                   AS "thu",
                     TIETBD.THOI_GIAN_BAT_DAU  AS "thoiGianBatDau",
                     TIETKT.THOI_GIAN_KET_THUC AS "thoiGianKetThuc"
              FROM DT_THOI_KHOA_BIEU TKB
                       LEFT JOIN DM_CA_HOC TIETBD on TIETBD.TEN = TKB.TIET_BAT_DAU AND TIETBD.MA_CO_SO = 2
                       LEFT JOIN DM_CA_HOC TIETKT
                                 on TO_NUMBER(TIETKT.TEN) = TO_NUMBER(TKB.TIET_BAT_DAU) + TO_NUMBER(TKB.SO_TIET_BUOI) AND
                                    TIETKT.MA_CO_SO = 2
              WHERE room = TKB.PHONG
                AND idNam = TKB.NAM
                AND hocKy = TKB.HOC_KY);
    RETURN my_cursor;

end;

/
--EndMethod--

CREATE OR REPLACE FUNCTION DT_CAU_TRUC_KHUNG_DAO_TAO_SEARCH_PAGE(pageNumber IN OUT NUMBER, pageSize IN OUT NUMBER,
                                                      searchTerm IN STRING,
                                                      totalItem OUT NUMBER, pageTotal OUT NUMBER)
    RETURN SYS_REFCURSOR
AS
    my_cursor SYS_REFCURSOR;
    sT        STRING(500) := '%' || lower(searchTerm) || '%';
BEGIN
    SELECT COUNT(*)
    INTO totalItem
    FROM DT_CAU_TRUC_KHUNG_DAO_TAO cauTrucKhungDt
    WHERE searchTerm = ''
       OR cauTrucKhungDt.NAM_DAO_TAO LIKE st;

    IF pageNumber < 1 THEN pageNumber := 1; END IF;
    IF pageSize < 1 THEN pageSize := 1; END IF;
    pageTotal := CEIL(totalItem / pageSize);
    pageNumber := LEAST(pageNumber, pageTotal);

    OPEN my_cursor FOR
        SELECT *
        FROM (SELECT cauTrucKhungDt.ID               as                      "id",
                     cauTrucKhungDt.BAT_DAU_DANG_KY  as                      "batDauDangKy",
                     cauTrucKhungDt.KET_THUC_DANG_KY as                      "ketThucDangKy",
                     cauTrucKhungDt.MUC_CHA          as                      "mucCha",
                     cauTrucKhungDt.MUC_CON          as                      "mucCon",
                     cauTrucKhungDt.NAM_DAO_TAO      as                      "namDaoTao",
                     ROW_NUMBER() OVER (ORDER BY cauTrucKhungDt.NAM_DAO_TAO) R
              FROM DT_CAU_TRUC_KHUNG_DAO_TAO cauTrucKhungDt
              WHERE searchTerm = ''
                 OR cauTrucKhungDt.NAM_DAO_TAO LIKE st)
        WHERE R BETWEEN (pageNumber - 1) * pageSize + 1 AND pageNumber * pageSize;
    RETURN my_cursor;
END;

/
--EndMethod--

CREATE OR REPLACE FUNCTION DT_DANG_KY_MO_MON_SEARCH_PAGE(pageNumber IN OUT NUMBER, pageSize IN OUT NUMBER,
                                              donVi IN STRING, searchTerm IN STRING,
                                              totalItem OUT NUMBER, pageTotal OUT NUMBER)
    RETURN SYS_REFCURSOR
AS
    my_cursor SYS_REFCURSOR;
    sT        STRING(500) := '%' || lower(searchTerm) || '%';
BEGIN
    SELECT COUNT(*)
    INTO totalItem
    FROM DT_DANG_KY_MO_MON dtDangKyMoMon
            LEFT JOIN DT_CAU_TRUC_KHUNG_DAO_TAO CT ON CT.ID = dtDangKyMoMon.NAM
             LEFT JOIN DM_DON_VI dmDv ON dmDv.MA = dtDangKyMoMon.KHOA

    WHERE (donVi IS NULL OR donVi = dmDv.MA);

    IF pageNumber < 1 THEN pageNumber := 1; END IF;
    IF pageSize < 1 THEN pageSize := 1; END IF;
    pageTotal := CEIL(totalItem / pageSize);
    pageNumber := LEAST(pageNumber, pageTotal);

    OPEN my_cursor FOR
        SELECT *
        FROM (
                 SELECT dtDangKyMoMon.KHOA      as            "khoa",
                        dtDangKyMoMon.HOC_KY    as            "hocKy",
                        CT.NAM_DAO_TAO       as            "namHoc",
                        dtDangKyMoMon.THOI_GIAN as            "thoiGian",
                        dtDangKyMoMon.GHI_CHU   as            "ghiChu",
                        dtDangKyMoMon.ID        as            "id",
                        dtDangKyMoMon.IS_DUYET  as            "isDuyet",
                        dmDv.TEN                as            "tenKhoaBoMon",
                        dtDangKyMoMon.MA_NGANH  as            "maNganh",
                        ds.TEN_NGANH            as            "tenNganh",
                        ROW_NUMBER() OVER (ORDER BY dmDv.TEN) R
                 FROM DT_DANG_KY_MO_MON dtDangKyMoMon
            LEFT JOIN DT_CAU_TRUC_KHUNG_DAO_TAO CT ON CT.ID = dtDangKyMoMon.NAM
                          LEFT JOIN DM_DON_VI dmDv ON dmDv.MA = dtDangKyMoMon.KHOA
                          LEFT JOIN DT_NGANH_DAO_TAO ds ON ds.MA_NGANH = dtDangKyMoMon.MA_NGANH
                 WHERE (donVi IS NULL OR donVi = dmDv.MA)
             )
        WHERE R BETWEEN (pageNumber - 1) * pageSize + 1 AND pageNumber * pageSize;
    RETURN my_cursor;
END;

/
--EndMethod--

CREATE OR REPLACE FUNCTION DT_DANH_SACH_CHUYEN_NGANH_SEARCH_PAGE(pageNumber IN OUT NUMBER, pageSize IN OUT NUMBER,
                                                      filter IN STRING, searchTerm IN STRING,
                                                      totalItem OUT NUMBER, pageTotal OUT NUMBER)
    RETURN SYS_REFCURSOR
AS
    my_cursor SYS_REFCURSOR;
    donVi     STRING(100);
    namHoc    STRING(100);
    maNganh   STRING(20);
    sT        STRING(500) := '%' || lower(searchTerm) || '%';
BEGIN
    SELECT JSON_VALUE(filter, '$.donVi') INTO donVi FROM DUAL;
    SELECT JSON_VALUE(filter, '$.nam') INTO namHoc FROM DUAL;
    SELECT JSON_VALUE(filter, '$.maNganh') INTO maNganh FROM DUAL;
    SELECT COUNT(*)
    INTO totalItem
    FROM DT_DANH_SACH_CHUYEN_NGANH chuyennganh
             LEFT JOIN DT_CAU_TRUC_KHUNG_DAO_TAO CT ON CT.ID = chuyennganh.NAM_HOC
             LEFT JOIN DM_DON_VI dmDv ON dmDv.MA = chuyennganh.KHOA
             LEFT JOIN DT_NGANH_DAO_TAO nganh ON nganh.MA_NGANH = chuyennganh.NGANH

    WHERE (nganh.KICH_HOAT = 1 AND (donVi IS NULL OR donVi = '' OR donVi = chuyennganh.KHOA)
        AND (namHoc IS NULL OR namHoc = '' OR namHoc = chuyennganh.NAM_HOC)
        AND (maNganh IS NULL OR maNganh = '' OR maNganh = chuyennganh.NGANH)
        AND (searchTerm = ''
            OR LOWER(dmDv.TEN) LIKE sT
            OR LOWER(chuyennganh.TEN) LIKE sT
            OR LOWER(NGANH.TEN_NGANH) LIKE sT)
              );
    IF pageNumber < 1 THEN pageNumber := 1; END IF;
    IF pageSize < 1 THEN pageSize := 1; END IF;
    pageTotal := CEIL(totalItem / pageSize);
    pageNumber := LEAST(pageNumber, pageTotal);

    OPEN my_cursor FOR
        SELECT *
        FROM (SELECT chuyennganh.ID      as                       "id",
                     chuyennganh.NAM_HOC as                       "namHoc",
                     chuyennganh.NGANH   as                       "nganh",
                     chuyennganh.KHOA    as                       "khoa",
                     chuyennganh.TEN     as                       "ten",
                     nganh.TEN_NGANH     as                       "tenNganh",
                     dmDv.TEN            as                       "tenKhoa",
                     CT.NAM_DAO_TAO      AS                       "namDaoTao",
                     ROW_NUMBER() OVER (ORDER BY chuyennganh.TEN) R
              FROM DT_DANH_SACH_CHUYEN_NGANH chuyennganh
                       LEFT JOIN DT_CAU_TRUC_KHUNG_DAO_TAO CT ON CT.ID = chuyennganh.NAM_HOC
                       LEFT JOIN DM_DON_VI dmDv ON dmDv.MA = chuyennganh.KHOA
                       LEFT JOIN DT_NGANH_DAO_TAO nganh ON nganh.MA_NGANH = chuyennganh.NGANH
              WHERE (nganh.KICH_HOAT = 1 AND (donVi IS NULL OR donVi = '' OR donVi = chuyennganh.KHOA)
                  AND (namHoc IS NULL OR namHoc = '' OR namHoc = chuyennganh.NAM_HOC)
                  AND (maNganh IS NULL OR maNganh = '' OR maNganh = chuyennganh.NGANH)
                  AND (searchTerm = ''
                      OR LOWER(dmDv.TEN) LIKE sT
                      OR LOWER(chuyennganh.TEN) LIKE sT
                      OR LOWER(NGANH.TEN_NGANH) LIKE sT)
                        )
              order by chuyennganh.KHOA, chuyennganh.NGANH)
        WHERE R BETWEEN (pageNumber - 1) * pageSize + 1 AND pageNumber * pageSize;
    RETURN my_cursor;
END;

/
--EndMethod--

CREATE OR REPLACE FUNCTION DT_DANH_SACH_MON_MO_GET_CURRENT(TG_MO_MON IN STRING, CHUONG_TRINH_DAO_TAO OUT SYS_REFCURSOR,
                                                THONG_TIN OUT SYS_REFCURSOR)
    RETURN SYS_REFCURSOR
AS
    DANH_SACH_MON_MO  SYS_REFCURSOR;
    KHOA_SINH_VIEN    NUMBER(4);
    HOC_KY_MO_MON     NUMBER(1);
    ID_DANG_KY_MO_MON NUMBER;
BEGIN
    SELECT JSON_VALUE(TG_MO_MON, '$.khoa') INTO KHOA_SINH_VIEN FROM DUAL;
    SELECT JSON_VALUE(TG_MO_MON, '$.hocKy') INTO HOC_KY_MO_MON FROM DUAL;
    SELECT JSON_VALUE(TG_MO_MON, '$.idDangKyMoMon') INTO ID_DANG_KY_MO_MON FROM DUAL;

    OPEN THONG_TIN FOR
        SELECT DKMM.KHOA     AS "khoaDangKy",
               DKMM.MA_NGANH AS "maNganh",
               NDT.TEN_NGANH AS "tenNganh",
               DV.TEN        AS "tenKhoaDangKy",
               DKMM.IS_DUYET AS "isDuyet"
        FROM DT_DANG_KY_MO_MON DKMM
                 LEFT JOIN DT_NGANH_DAO_TAO NDT ON NDT.MA_NGANH = DKMM.MA_NGANH
                 LEFT JOIN DM_DON_VI DV ON DV.MA = DKMM.KHOA
        WHERE DKMM.ID = ID_DANG_KY_MO_MON;

    OPEN CHUONG_TRINH_DAO_TAO FOR
        SELECT CTDT.MA_MON_HOC        AS "maMonHoc",
               MH.TEN                 AS "tenMonHoc",
               CTDT.SO_TIET_LY_THUYET AS "soTietLyThuyet",
               CTDT.SO_TIET_THUC_HANH AS "soTietThucHanh",
               CTDT.HOC_KY_DU_KIEN    AS "hocKyDuKien",
               CTDT.LOAI_MON_HOC      AS "loaiMonHoc",
               CTDT.KHOA              AS "khoa",
               MH.KHOA                AS "monHocKhoa",
               CTDT.TONG_SO_TIET      AS "tongSoTiet",
               CTKDT.KHOA             AS "khoaSinhVien"

        FROM DT_CHUONG_TRINH_DAO_TAO CTDT
                 LEFT JOIN DT_KHUNG_DAO_TAO KDT ON KDT.ID = CTDT.MA_KHUNG_DAO_TAO
                 LEFT JOIN DT_CAU_TRUC_KHUNG_DAO_TAO CTKDT on KDT.NAM_DAO_TAO = CTKDT.ID
                 LEFT JOIN DT_DANG_KY_MO_MON DKMM ON DKMM.MA_NGANH = KDT.MA_NGANH
                 LEFT JOIN DM_MON_HOC MH ON MH.MA = CTDT.MA_MON_HOC
        WHERE DKMM.ID = ID_DANG_KY_MO_MON
            AND MH.KHOA != 33
            AND
            --E.g: Current Semester: 1, Current Year: 2022
              (CTKDT.KHOA = KHOA_SINH_VIEN AND CTDT.HOC_KY_DU_KIEN = HOC_KY_MO_MON)         -- Student 2022 - Sem 1
           OR (CTKDT.KHOA = KHOA_SINH_VIEN - 1 AND CTDT.HOC_KY_DU_KIEN = HOC_KY_MO_MON + 2) -- Student 2021 - Sem 3
           OR (CTKDT.KHOA = KHOA_SINH_VIEN - 2 AND CTDT.HOC_KY_DU_KIEN = HOC_KY_MO_MON + 4) -- Student 2021 - Sem 3
           OR (CTKDT.KHOA = KHOA_SINH_VIEN - 3 AND CTDT.HOC_KY_DU_KIEN = HOC_KY_MO_MON + 6) -- Student 2021 - Sem 3
    ;


    OPEN DANH_SACH_MON_MO FOR
        SELECT DS.MA_MON_HOC        as "maMonHoc",
               DS.TEN_MON_HOC       AS "tenMonHoc",
               DS.LOAI_MON_HOC      AS "loaiMonHoc",
               DS.SO_TIET_LY_THUYET AS "soTietLyThuyet",
               DS.SO_TIET_THUC_HANH AS "soTietThucHanh",
               DS.NAM               AS "nam",
               DS.HOC_KY            AS "hocKy",
               DS.MA_NGANH          AS "maNganh",
               DS.CHUYEN_NGANH      AS "chuyenNganh",
               DS.ID                AS "id",
               DS.SO_LOP            AS "soLop",
               DS.SO_BUOI_TUAN      AS "soBuoiTuan",
               DS.SO_TIET_BUOI      AS "soTietBuoi",
               DS.SO_LUONG_DU_KIEN  AS "soLuongDuKien",
               DS.KHOA              AS "monHocKhoa",
               DS.KHOA_SV           AS "khoaSv",
               CN.TEN               AS "tenChuyenNganh",
               DS.MA_DANG_KY        AS "maDangKy"
        FROM DT_DANH_SACH_MON_MO DS
                 LEFT JOIN DT_DANH_SACH_CHUYEN_NGANH CN ON CN.ID = DS.CHUYEN_NGANH
    WHERE DS.MA_DANG_KY = ID_DANG_KY_MO_MON;

    return DANH_SACH_MON_MO;
END;

/
--EndMethod--

CREATE OR REPLACE FUNCTION DT_KHUNG_DAO_TAO_SEARCH_PAGE(pageNumber IN OUT NUMBER, pageSize IN OUT NUMBER, donVi IN STRING,
                                             searchTerm IN STRING, namDaoTao IN STRING,
                                             totalItem OUT NUMBER, pageTotal OUT NUMBER) RETURN SYS_REFCURSOR
AS
    my_cursor SYS_REFCURSOR;
    sT        STRING(502) := '%' || lower(searchTerm) || '%';
BEGIN
    SELECT COUNT(*)
    INTO totalItem
    FROM DT_KHUNG_DAO_TAO KDT
             LEFT JOIN DT_DANH_SACH_CHUYEN_NGANH CN ON CN.ID = KDT.CHUYEN_NGANH
             LEFT JOIN DM_DON_VI DV ON DV.MA = KDT.MA_KHOA
             LEFT JOIN DT_NGANH_DAO_TAO DNDT on KDT.MA_NGANH = DNDT.MA_NGANH
             LEFT JOIN DT_CAU_TRUC_KHUNG_DAO_TAO KHUNG ON KHUNG.ID = KDT.NAM_DAO_TAO

    WHERE (donVi IS NULL OR donVi = '' OR TO_NUMBER(donVi) = KDT.MA_KHOA)
      AND (searchTerm = ''
        OR LOWER(TRIM(DNDT.MA_NGANH)) LIKE sT
        OR LOWER(TRIM(DNDT.TEN_NGANH)) LIKE sT
        OR LOWER(TRIM(KDT.NAM_DAO_TAO)) LIKE sT
        OR LOWER(TRIM(DV.TEN)) LIKE sT)
      AND (namDaoTao IS NULL OR namDaoTao = '' OR TO_NUMBER(namDaoTao) = KDT.NAM_DAO_TAO);

    IF pageNumber < 1 THEN pageNumber := 1; END IF;
    IF pageSize < 1 THEN pageSize := 1; END IF;
    pageTotal := CEIL(totalItem / pageSize);
    pageNumber := LEAST(pageNumber, pageTotal);

    OPEN my_cursor FOR
        SELECT *
        FROM (SELECT KDT.MA_KHOA           AS                          "maKhoa",
                     KDT.NAM_DAO_TAO       AS                          "idNamDaoTao",
                     KHUNG.NAM_DAO_TAO     AS                          "namDaoTao",
                     KDT.ID                AS                          "id",
                     KDT.MA_NGANH          AS                          "maNganh",
                     DNDT.TEN_NGANH        AS                          "tenNganh",
                     BDT.TEN_BAC           AS                          "trinhDoDaoTao",
                     LHDT.TEN              AS                          "loaiHinhDaoTao",
                     KDT.THOI_GIAN_DAO_TAO AS                          "thoiGianDaoTao",
                     DV.TEN                AS                          "tenKhoaBoMon",
                     CN.TEN                AS                          "tenChuyenNganh",
                     ROW_NUMBER() OVER (ORDER BY KDT.NAM_DAO_TAO DESC) R
              FROM DT_KHUNG_DAO_TAO KDT
                       LEFT JOIN DT_DANH_SACH_CHUYEN_NGANH CN ON CN.ID = KDT.CHUYEN_NGANH
                       LEFT JOIN DM_DON_VI DV ON DV.MA = KDT.MA_KHOA
                       LEFT JOIN DT_NGANH_DAO_TAO DNDT on KDT.MA_NGANH = DNDT.MA_NGANH
                       LEFT JOIN DT_CAU_TRUC_KHUNG_DAO_TAO KHUNG ON KHUNG.ID = KDT.NAM_DAO_TAO

                       LEFT JOIN DM_SV_BAC_DAO_TAO BDT ON BDT.MA_BAC = KDT.TRINH_DO_DAO_TAO
                       LEFT JOIN DM_SV_LOAI_HINH_DAO_TAO LHDT ON LHDT.MA = KDT.LOAI_HINH_DAO_TAO
              WHERE (donVi IS NULL OR donVi = '' OR TO_NUMBER(donVi) = KDT.MA_KHOA)
                AND (searchTerm = ''
                  OR LOWER(TRIM(DNDT.MA_NGANH)) LIKE sT
                  OR LOWER(TRIM(DNDT.TEN_NGANH)) LIKE sT
                  OR LOWER(TRIM(KDT.NAM_DAO_TAO)) LIKE sT
                  OR LOWER(TRIM(DV.TEN)) LIKE sT)
                AND (namDaoTao IS NULL OR namDaoTao = '' OR TO_NUMBER(namDaoTao) = KDT.NAM_DAO_TAO)
              ORDER BY KDT.NAM_DAO_TAO DESC)
        WHERE R BETWEEN (pageNumber - 1) * pageSize + 1 AND pageNumber * pageSize;
    RETURN my_cursor;
END;

/
--EndMethod--

CREATE OR REPLACE FUNCTION DT_NGANH_TO_HOP_SEARCH_PAGE(pageNumber IN OUT NUMBER, pageSize IN OUT NUMBER, donVi IN STRING,
                                            searchTerm IN STRING,
                                            totalItem OUT NUMBER, pageTotal OUT NUMBER) RETURN SYS_REFCURSOR
AS
    my_cursor SYS_REFCURSOR;
    sT        STRING(502) := '%' || lower(searchTerm) || '%';
BEGIN
    SELECT COUNT(*)
    INTO totalItem
    FROM DT_NGANH_TO_HOP NTH
             LEFT JOIN DT_NGANH_DAO_TAO DMNDT ON DMNDT.MA_NGANH = NTH.MA
             LEFT JOIN DM_SV_TO_HOP_TS DMTHTS ON DMTHTS.MA_TO_HOP = NTH.MA_TO_HOP
             LEFT JOIN DM_SV_MON_THI DMMT_1 ON DMMT_1.ID = DMTHTS.MON_1
             LEFT JOIN DM_SV_MON_THI DMMT_2 ON DMMT_2.ID = DMTHTS.MON_2
             LEFT JOIN DM_SV_MON_THI DMMT_3 ON DMMT_3.ID = DMTHTS.MON_3

    WHERE (donVi IS NULL OR donVi = '' OR donVi = DMNDT.KHOA)
      AND (searchTerm = ''
        OR LOWER(TRIM(DMNDT.TEN_NGANH)) LIKE sT
        OR LOWER(TRIM(DMTHTS.MA_TO_HOP)) LIKE sT
        OR LOWER(TRIM(DMMT_1.TEN)) LIKE sT
        OR LOWER(TRIM(DMMT_2.TEN)) LIKE sT
        OR LOWER(TRIM(DMMT_3.TEN)) LIKE sT);

    IF pageNumber < 1 THEN pageNumber := 1; END IF;
    IF pageSize < 1 THEN pageSize := 1; END IF;
    pageTotal := CEIL(totalItem / pageSize);
    pageNumber := LEAST(pageNumber, pageTotal);

    OPEN my_cursor FOR
        SELECT *
        FROM (
                 SELECT NTH.MA_TO_HOP   AS                           "maToHop",
                        NTH.MA          AS                           "maNganh",
                        NTH.ID          AS                           "id",
                        DMMT_1.TEN      AS                           "tenMon1",
                        DMMT_2.TEN      AS                           "tenMon2",
                        DMMT_3.TEN      AS                           "tenMon3",
                        DMNDT.TEN_NGANH AS                           "tenNganh",
                        NTH.KICH_HOAT   AS                           "kichHoat",
                        ROW_NUMBER() OVER (ORDER BY DMNDT.TEN_NGANH) R
                 FROM DT_NGANH_TO_HOP NTH
                          LEFT JOIN DT_NGANH_DAO_TAO DMNDT ON DMNDT.MA_NGANH = NTH.MA
                          LEFT JOIN DM_SV_TO_HOP_TS DMTHTS ON DMTHTS.MA_TO_HOP = NTH.MA_TO_HOP
                          LEFT JOIN DM_SV_MON_THI DMMT_1 ON DMMT_1.ID = DMTHTS.MON_1
                          LEFT JOIN DM_SV_MON_THI DMMT_2 ON DMMT_2.ID = DMTHTS.MON_2
                          LEFT JOIN DM_SV_MON_THI DMMT_3 ON DMMT_3.ID = DMTHTS.MON_3
                 WHERE (donVi IS NULL OR donVi = '' OR donVi = DMNDT.KHOA)
                   AND (searchTerm = ''
                     OR LOWER(TRIM(DMNDT.TEN_NGANH)) LIKE sT
                     OR LOWER(TRIM(DMTHTS.MA_TO_HOP)) LIKE sT
                     OR LOWER(TRIM(DMMT_1.TEN)) LIKE sT
                     OR LOWER(TRIM(DMMT_2.TEN)) LIKE sT
                     OR LOWER(TRIM(DMMT_3.TEN)) LIKE sT)
                 ORDER BY DMNDT.TEN_NGANH
             )
        WHERE R BETWEEN (pageNumber - 1) * pageSize + 1 AND pageNumber * pageSize;
    RETURN my_cursor;
END;

/
--EndMethod--

CREATE OR REPLACE FUNCTION DT_THOI_KHOA_BIEU_SEARCH_PAGE(pageNumber IN OUT NUMBER, pageSize IN OUT NUMBER, donVi IN STRING,
                                              searchTerm IN STRING,
                                              totalItem OUT NUMBER, pageTotal OUT NUMBER,
                                              thoiGianPhanCong OUT SYS_REFCURSOR) RETURN SYS_REFCURSOR
AS
    my_cursor SYS_REFCURSOR;
    sT        STRING(502) := '%' || lower(searchTerm) || '%';
BEGIN
    SELECT COUNT(*)
    INTO totalItem
    FROM DT_THOI_KHOA_BIEU TKB
             LEFT JOIN DT_CAU_TRUC_KHUNG_DAO_TAO CTKDT ON CTKDT.ID = TKB.NAM
             LEFT JOIN DM_DON_VI DV1 ON DV1.MA = TKB.KHOA_DANG_KY
             LEFT JOIN DM_MON_HOC DMMH ON DMMH.MA = TKB.MA_MON_HOC
             LEFT JOIN DM_DON_VI DV ON DV.MA = DMMH.KHOA
             LEFT JOIN TCHC_CAN_BO CB on TKB.GIANG_VIEN = CB.SHCC
             LEFT JOIN DM_NGACH_CDNN NGACH on CB.NGACH = NGACH.MA
             LEFT JOIN DM_TRINH_DO TD ON TD.MA = CB.HOC_VI
             LEFT JOIN DT_NGANH_DAO_TAO NDT on TKB.MA_NGANH = NDT.MA_NGANH
             LEFT JOIN DT_THOI_GIAN_MO_MON TGMM ON TGMM.NAM = CTKDT.ID
    WHERE (TGMM.KICH_HOAT = 1)
      AND (donVi IS NULL OR donVi = '' OR donVi = TKB.KHOA_DANG_KY)
      AND (searchTerm = ''
        OR LOWER(TRIM(DMMH.TEN)) LIKE sT
        OR LOWER(TRIM(DV.TEN)) LIKE sT
        OR LOWER(TRIM(TKB.MA_MON_HOC)) LIKE sT
        OR LOWER(TRIM(TKB.HOC_KY)) LIKE sT
        OR LOWER('thứ' || ' ' || TRIM(TKB.THU)) LIKE lower(searchTerm)
        OR LOWER(TRIM(TKB.PHONG)) LIKE lower(searchTerm)
        OR LOWER(TRIM(CB.HO || ' ' || CB.TEN)) LIKE sT);

    IF pageNumber < 1 THEN pageNumber := 1; END IF;
    IF pageSize < 1 THEN pageSize := 1; END IF;
    pageTotal := CEIL(totalItem / pageSize);
    pageNumber := LEAST(pageNumber, pageTotal);

    OPEN thoiGianPhanCong FOR
        SELECT *
        FROM (SELECT TGPC.BAT_DAU                         AS "batDau",
                     TGPC.KET_THUC                        AS "ketThuc",
                     TGPC.DON_VI                          AS "donVi",
                     DV.TEN                               AS "tenDonVi",
                     CTKDT.NAM_DAO_TAO                    AS "namDaoTao",
                     TGPC.HOC_KY                          AS "hocKy",

                     (SELECT COUNT(*)
                      FROM DT_THOI_KHOA_BIEU TKB
                               LEFT JOIN DT_CAU_TRUC_KHUNG_DAO_TAO CTKDT ON CTKDT.ID = TKB.NAM
                               LEFT JOIN DM_DON_VI DV1 ON DV1.MA = TKB.KHOA_DANG_KY
                               LEFT JOIN DT_THOI_GIAN_MO_MON TGMM ON TGMM.NAM = CTKDT.ID
                      WHERE (TGMM.KICH_HOAT = 1)
                        AND TKB.KHOA_DANG_KY = DV.MA)     AS "tongSoLop",

                     (SELECT COUNT(*)
                      FROM DT_THOI_KHOA_BIEU TKB
                               LEFT JOIN DT_CAU_TRUC_KHUNG_DAO_TAO CTKDT ON CTKDT.ID = TKB.NAM
                               LEFT JOIN DM_DON_VI DV1 ON DV1.MA = TKB.KHOA_DANG_KY
                               LEFT JOIN DT_THOI_GIAN_MO_MON TGMM ON TGMM.NAM = CTKDT.ID
                      WHERE (TGMM.KICH_HOAT = 1)
                        AND TKB.KHOA_DANG_KY = DV.MA
                        AND (TKB.GIANG_VIEN IS NOT NULL)) AS "daPhanCong"

              FROM DT_THOI_GIAN_PHAN_CONG TGPC
                       LEFT JOIN DT_CAU_TRUC_KHUNG_DAO_TAO CTKDT ON CTKDT.ID = TGPC.NAM
                       LEFT JOIN DT_THOI_GIAN_MO_MON TGMM ON TGMM.NAM = CTKDT.ID
                       LEFT JOIN DM_DON_VI DV ON DV.MA = TGPC.DON_VI
              WHERE (donVi IS NULL OR donVi = '' OR donVi = TGPC.DON_VI));

    OPEN my_cursor FOR
        SELECT *
        FROM (SELECT TKB.ID               AS              "id",
                     TKB.PHONG            AS              "phong",
                     TKB.THU              AS              "thu",
                     TKB.TIET_BAT_DAU     AS              "tietBatDau",
                     TKB.SO_TIET_BUOI     AS              "soTiet",
                     TKB.HOC_KY           AS              "hocKy",
                     TKB.NAM              AS              "nam",
                     TKB.MA_MON_HOC       AS              "maMonHoc",
                     TKB.NGAY_BAT_DAU     AS              "ngayBatDau",
                     TKB.NGAY_KET_THUC    AS              "ngayKetThuc",
                     TKB.LOAI_MON_HOC     AS              "loaiMonHoc",
                     TKB.NHOM             AS              "nhom",
                     TKB.SO_LUONG_DU_KIEN AS              "soLuongDuKien",
                     DV.TEN               AS              "tenKhoaBoMon",
                     DV.MA                AS              "maKhoaBoMon",
                     DMMH.TEN             AS              "tenMonHoc",
                     DMMH.TONG_TIET       AS              "tongTiet",
                     TKB.KHOA_DANG_KY     AS              "khoaDangKy",
                     DV1.TEN              AS              "tenKhoaDangKy",
                     CB.HO                AS              "hoGiangVien",
                     CB.TEN               AS              "tenGiangVien",
                     TKB.GIANG_VIEN       as              "giangVien",
                     TD.VIET_TAT          AS              "trinhDo",
                     TKB.SUC_CHUA         AS              "sucChua",
                     TKB.MA_NGANH         AS              "maNganh",
                     NDT.TEN_NGANH        AS              "tenNganh",
                     TKB.BUOI             AS              "buoi",
                     TKB.IS_MO            AS              "isMo",
                     CTKDT.NAM_DAO_TAO    AS              "namDaoTao",
                     ROW_NUMBER() OVER (ORDER BY TKB.THU) R
              FROM DT_THOI_KHOA_BIEU TKB
                       LEFT JOIN DT_CAU_TRUC_KHUNG_DAO_TAO CTKDT ON CTKDT.ID = TKB.NAM
                       LEFT JOIN DM_DON_VI DV1 ON DV1.MA = TKB.KHOA_DANG_KY
                       LEFT JOIN DM_MON_HOC DMMH ON DMMH.MA = TKB.MA_MON_HOC
                       LEFT JOIN DM_DON_VI DV ON DV.MA = DMMH.KHOA
                       LEFT JOIN TCHC_CAN_BO CB on TKB.GIANG_VIEN = CB.SHCC
                       LEFT JOIN DM_NGACH_CDNN NGACH on CB.NGACH = NGACH.MA
                       LEFT JOIN DM_TRINH_DO TD ON TD.MA = CB.HOC_VI
                       LEFT JOIN DT_NGANH_DAO_TAO NDT on TKB.MA_NGANH = NDT.MA_NGANH
                       LEFT JOIN DT_THOI_GIAN_MO_MON TGMM ON TGMM.NAM = CTKDT.ID
              WHERE (TGMM.KICH_HOAT = 1)
                AND (donVi IS NULL OR donVi = '' OR donVi = TKB.KHOA_DANG_KY)
                AND (searchTerm = ''
                  OR LOWER(TRIM(DMMH.TEN)) LIKE sT
                  OR LOWER(TRIM(DV.TEN)) LIKE sT
                  OR LOWER(TRIM(TKB.MA_MON_HOC)) LIKE sT
                  OR LOWER(TRIM(TKB.HOC_KY)) LIKE sT
                  OR LOWER('thứ' || ' ' || TRIM(TKB.THU)) LIKE lower(searchTerm)
                  OR LOWER(TRIM(TKB.PHONG)) LIKE lower(searchTerm)
                  OR LOWER(TRIM(CB.HO || ' ' || CB.TEN)) LIKE sT)
              ORDER BY TKB.THU, TKB.KHOA_DANG_KY)
        WHERE R BETWEEN (pageNumber - 1) * pageSize + 1 AND pageNumber * pageSize;
    RETURN my_cursor;
END ;

/
--EndMethod--

CREATE OR REPLACE FUNCTION dv_website_gioi_thieu_create_new_item (p_maDonVi in nvarchar2, p_ten in nvarchar2, p_noiDung in clob, p_trongSo in number,  p_kichHoat in number) RETURN NUMBER
IS
    maxThuTu number;
    last_id DV_WEBSITE_GIOI_THIEU.ma%TYPE;
BEGIN
    begin
        select MAX(THU_TU) into maxThuTu from DV_WEBSITE_GIOI_THIEU where MA_DON_VI=p_maDonVi;
    exception
        when NO_DATA_FOUND then
        maxThuTu := 0;
    end;
    if maxThuTu is null then
        maxThuTu := 0;
    end if;
    maxThuTu := maxThuTu+1;

    insert into DV_WEBSITE_GIOI_THIEU (ma_don_vi, ten, thu_tu, noi_dung, trong_so, kich_hoat) values (p_maDonVi, p_ten, maxThuTu, p_noiDung, p_trongSo, p_kichHoat)
    returning ma into last_id;

    commit;
    return last_id;
END;

/
--EndMethod--

CREATE OR REPLACE FUNCTION dv_website_gioi_thieu_hinh_create_new_item (p_link in nvarchar2, p_maWebsiteGioiThieu in nvarchar2, p_image in nvarchar2, p_kichHoat in number) RETURN NUMBER
IS
    maxThuTu number;
    last_id DV_WEBSITE_GIOI_THIEU_HINH.ma%TYPE;
BEGIN
    begin
        select MAX(THU_TU) into maxThuTu from DV_WEBSITE_GIOI_THIEU_HINH where MA_WEBSITE_GIOI_THIEU=p_maWebsiteGioiThieu;
    exception
        when NO_DATA_FOUND then
        maxThuTu := 0;
    end;
    if maxThuTu is null then
        maxThuTu := 0;
    end if;
    maxThuTu := maxThuTu+1;

    insert into DV_WEBSITE_GIOI_THIEU_HINH (thu_tu, link, ma_website_gioi_thieu, image, kich_hoat) values (maxThuTu, p_link, p_maWebsiteGioiThieu, p_image, p_kichHoat)
    returning ma into last_id;

    commit;
    return last_id;
END;

/
--EndMethod--

CREATE OR REPLACE procedure dv_website_gioi_thieu_hinh_swap_thu_tu(p_id in number, p_is_move_up in number, p_maWebsiteGioiThieu in nvarchar2)
IS
    thuTu1 number;
    thuTu2 number;
    id2 number;
BEGIN
    begin
        select THU_TU into thuTu1 from DV_WEBSITE_GIOI_THIEU_HINH where MA=p_id and MA_WEBSITE_GIOI_THIEU=p_maWebsiteGioiThieu ;

        if p_is_move_up=1 then
            select MA,THU_TU into id2,thuTu2 from DV_WEBSITE_GIOI_THIEU_HINH where THU_TU>thuTu1 and MA_WEBSITE_GIOI_THIEU=p_maWebsiteGioiThieu order by THU_TU asc
                fetch first 1 row only;
        else
            select MA,THU_TU into id2,thuTu2 from DV_WEBSITE_GIOI_THIEU_HINH where THU_TU<thuTu1 and MA_WEBSITE_GIOI_THIEU=p_maWebsiteGioiThieu order by THU_TU desc
                fetch first 1 row only;
        end if;

        if id2 is not null then
            update DV_WEBSITE_GIOI_THIEU_HINH set THU_TU=thuTu2 where MA=p_id;
            update DV_WEBSITE_GIOI_THIEU_HINH set THU_TU=thuTu1 where MA=id2;
        end if;
    exception
        when NO_DATA_FOUND then
        thuTu1 := -1;
    end;
    commit;
END;

/
--EndMethod--

CREATE OR REPLACE procedure dv_website_gioi_thieu_swap_thu_tu(p_id in number, p_is_move_up in number, p_maDonVi in nvarchar2)
IS
    thuTu1 number;
    thuTu2 number;
    id2 number;
BEGIN
    begin
        select THU_TU into thuTu1 from DV_WEBSITE_GIOI_THIEU where MA=p_id and MA_DON_VI=p_maDonVi ;

        if p_is_move_up=1 then
            select MA,THU_TU into id2,thuTu2 from DV_WEBSITE_GIOI_THIEU where THU_TU<thuTu1 and MA_DON_VI=p_maDonVi order by THU_TU desc
                fetch first 1 row only;
        else
            select MA,THU_TU into id2,thuTu2 from DV_WEBSITE_GIOI_THIEU where THU_TU>thuTu1 and MA_DON_VI=p_maDonVi order by THU_TU asc
                fetch first 1 row only;
        end if;

        if id2 is not null then
            update DV_WEBSITE_GIOI_THIEU set THU_TU=thuTu2 where MA=p_id;
            update DV_WEBSITE_GIOI_THIEU set THU_TU=thuTu1 where MA=id2;
        end if;
    exception
        when NO_DATA_FOUND then
        thuTu1 := -1;
    end;
    commit;
END;

/
--EndMethod--

CREATE OR REPLACE FUNCTION dv_website_hinh_create_new_item (p_maDonVi in nvarchar2, p_image in nvarchar2, p_tieuDe in nvarchar2, p_link in nvarchar2,  p_kichHoat in number) RETURN NUMBER
IS
    maxThuTu number;
    last_id DV_WEBSITE_HINH.ma%TYPE;
BEGIN
    begin
        select MAX(THU_TU) into maxThuTu from DV_WEBSITE_HINH where MA_DON_VI=p_maDonVi;
    exception
        when NO_DATA_FOUND then
        maxThuTu := 0;
    end;
    if maxThuTu is null then
        maxThuTu := 0;
    end if;
    maxThuTu := maxThuTu+1;

    insert into DV_WEBSITE_HINH (ma_don_vi, image, tieu_de, link, thu_tu, kich_hoat) values (p_maDonVi, p_image, p_tieuDe, p_link, maxThuTu, p_kichHoat)
    returning ma into last_id;

    commit;
    return last_id;
END;

/
--EndMethod--

CREATE OR REPLACE procedure dv_website_hinh_swap_thu_tu(p_id in number, p_is_move_up in number, p_maDonVi in nvarchar2)
IS
    thuTu1 number;
    thuTu2 number;
    id2 number;
BEGIN
    begin
        select THU_TU into thuTu1 from DV_WEBSITE_HINH where MA=p_id and MA_DON_VI=p_maDonVi ;

        if p_is_move_up=1 then
            select MA,THU_TU into id2,thuTu2 from DV_WEBSITE_HINH where THU_TU>thuTu1 and MA_DON_VI=p_maDonVi order by THU_TU asc
                fetch first 1 row only;
        else
            select MA,THU_TU into id2,thuTu2 from DV_WEBSITE_HINH where THU_TU<thuTu1 and MA_DON_VI=p_maDonVi order by THU_TU desc
                fetch first 1 row only;
        end if;

        if id2 is not null then
            update DV_WEBSITE_HINH set THU_TU=thuTu2 where MA=p_id;
            update DV_WEBSITE_HINH set THU_TU=thuTu1 where MA=id2;
        end if;
    exception
        when NO_DATA_FOUND then
        thuTu1 := -1;
    end;
    commit;
END;

/
--EndMethod--

CREATE OR REPLACE FUNCTION DV_WEBSITE_SEARCH_PAGE(pageNumber IN OUT NUMBER, pageSize IN OUT NUMBER, searchTerm IN STRING,
                                  totalItem OUT NUMBER, pageTotal OUT NUMBER) RETURN SYS_REFCURSOR
AS
    my_cursor SYS_REFCURSOR;
    sT        STRING(500) := '%' || lower(searchTerm) || '%';
BEGIN
    SELECT COUNT(*)
    INTO totalItem
    FROM DV_WEBSITE ws
             LEFT JOIN DM_DON_VI dv on ws.MA_DON_VI = dv.MA
    WHERE searchTerm = ''
        OR LOWER(ws.SHORTNAME) LIKE sT
        OR LOWER(dv.TEN) LIKE sT;

    pageTotal := CEIL(totalItem / pageSize);
    pageNumber := LEAST(pageNumber, pageTotal);
    IF pageNumber < 1 THEN pageNumber := 1; END IF;
    IF pageSize < 1 THEN pageSize := 1; END IF;

    OPEN my_cursor FOR
        SELECT *
        FROM (
                SELECT  ws.SHORTNAME                         AS  "shortname",
                        ws.KICH_HOAT                         AS  "kichHoat",
                        ws.WEBSITE                           AS  "website",
                        ws.MA_DON_VI                         AS  "maDonVi",
                        dv.TEN                               AS  "tenDonVi",
                        ROW_NUMBER() OVER (ORDER BY ws.SHORTNAME DESC) R
                FROM DV_WEBSITE ws

                    LEFT JOIN DM_DON_VI dv on ws.MA_DON_VI = dv.MA

                WHERE searchTerm = ''
                OR LOWER(ws.SHORTNAME) LIKE sT
                OR LOWER(dv.TEN) LIKE sT
             )
        WHERE R BETWEEN (pageNumber - 1) * pageSize + 1 AND pageNumber * pageSize;
    RETURN my_cursor;
END;

/
--EndMethod--

CREATE OR REPLACE FUNCTION FW_ASSIGN_ROLE_GET_CURRENT_ROLES(nguoiDuocGan IN STRING, nhomRole IN STRING) RETURN SYS_REFCURSOR
AS
    my_cursor SYS_REFCURSOR;
BEGIN
    OPEN my_cursor FOR
        SELECT AR.ID                        AS      "id",
               AR.NGUOI_GAN                 AS      "nguoiGan",
               AR.NGUOI_DUOC_GAN            AS      "nguoiDuocGan",
               AR.NGAY_BAT_DAU              AS      "ngayBatDau",
               AR.NGAY_KET_THUC             AS      "ngayKetThuc",
               CB1.EMAIL                    AS      "emailNguoiDuocGan",
               AR.TEN_ROLE                  AS      "tenRole",
               AR.NHOM_ROLE                 AS      "nhomRole",
               TRIM(CB.HO || ' ' || CB.TEN) AS      "tenNguoiGan",
               ROW_NUMBER() OVER (ORDER BY ID DESC) R
        FROM FW_ASSIGN_ROLE AR
                 LEFT JOIN TCHC_CAN_BO CB ON AR.NGUOI_GAN = CB.SHCC
                 LEFT JOIN TCHC_CAN_BO CB1 ON AR.NGUOI_DUOC_GAN = CB1.SHCC
        WHERE AR.NGUOI_DUOC_GAN = nguoiDuocGan
          AND AR.NHOM_ROLE IN (SELECT regexp_substr(nhomRole, '[^,]+', 1, level)
                               from dual
                               connect by regexp_substr(nhomRole, '[^,]+', 1, level) is not null);
    RETURN my_cursor;
END;

/
--EndMethod--

CREATE OR REPLACE FUNCTION FW_STUDENT_SEARCH_PAGE(pageNumber IN OUT NUMBER, pageSize IN OUT NUMBER,
                                       listFaculty IN STRING, listFromCity IN STRING, listEthnic IN STRING,
                                       listNationality IN STRING, listReligion IN STRING, listLoaiHinhDaoTao IN STRING,
                                       listLoaiSinhVien IN STRING, listTinhTrangSinhVien IN STRING,
                                       gender IN STRING, searchTerm IN STRING,
                                       totalItem OUT NUMBER, pageTotal OUT NUMBER) RETURN SYS_REFCURSOR
AS
    STUDENT_INFO SYS_REFCURSOR;
    ST           STRING(500) := '%' || lower(searchTerm) || '%';

BEGIN
    SELECT COUNT(*)
    INTO totalItem

    FROM FW_STUDENT STU
             LEFT JOIN DM_SV_LOAI_HINH_DAO_TAO LHDT ON LHDT.MA = STU.LOAI_HINH_DAO_TAO
             LEFT JOIN DM_LOAI_SINH_VIEN LSV on LSV.MA = STU.LOAI_SINH_VIEN
             LEFT JOIN DM_GIOI_TINH GT ON GT.MA = STU.GIOI_TINH
             LEFT JOIN DM_QUOC_GIA QG ON QG.MA_CODE = STU.QUOC_GIA
             LEFT JOIN DM_DAN_TOC DANTOC ON DANTOC.MA = STU.DAN_TOC
             LEFT JOIN DM_TON_GIAO TONGIAO ON TONGIAO.MA = STU.TON_GIAO
             LEFT JOIN DM_TINH_THANH_PHO TINHTHANH ON TINHTHANH.MA = STU.THUONG_TRU_MA_TINH
             LEFT JOIN DM_DON_VI KHOA ON KHOA.MA = STU.KHOA
             LEFT JOIN DM_TINH_TRANG_SINH_VIEN TTSV ON TTSV.MA = STU.TINH_TRANG
    WHERE (
                  (listFaculty IS NOT NULL AND STU.KHOA IN (SELECT regexp_substr(listFaculty, '[^,]+', 1, level)
                                                            from dual
                                                            connect by regexp_substr(listFaculty, '[^,]+', 1, level) is not null) OR
                   listFaculty IS NULL)
                  AND (listFromCity IS NOT NULL AND INSTR(listFromCity, STU.THUONG_TRU_MA_TINH) != 0 OR
                       listFromCity IS NULL)
                  AND (listEthnic IS NOT NULL AND INSTR(listEthnic, STU.DAN_TOC) != 0 OR listEthnic IS NULL)
                  AND
                  (listNationality IS NOT NULL AND INSTR(listNationality, STU.QUOC_GIA) != 0 OR listNationality IS NULL)
                  AND (listReligion IS NOT NULL AND INSTR(listReligion, STU.DAN_TOC) != 0 OR listReligion IS NULL)
                  AND (listLoaiHinhDaoTao IS NOT NULL AND INSTR(listLoaiHinhDaoTao, STU.LOAI_HINH_DAO_TAO) != 0 OR
                       listLoaiHinhDaoTao IS NULL)
                  AND (listLoaiSinhVien IS NOT NULL AND INSTR(listLoaiSinhVien, STU.LOAI_SINH_VIEN) != 0 OR
                       listLoaiSinhVien IS NULL)
                  AND (listTinhTrangSinhVien IS NOT NULL AND INSTR(listTinhTrangSinhVien, STU.TINH_TRANG) != 0 OR
                       listTinhTrangSinhVien IS NULL)
                  AND (gender IS NOT NULL AND ('0' + STU.GIOI_TINH) = gender OR gender IS NULL));


    IF pageNumber < 1 THEN pageNumber := 1; END IF;
    IF pageSize < 1 THEN pageSize := 1; END IF;
    pageTotal := CEIL(totalItem / pageSize);
    pageNumber := LEAST(pageNumber, pageTotal);

    OPEN STUDENT_INFO FOR
        SELECT *
        FROM (
                 SELECT STU.MSSV           AS                                                     "mssv",
                        STU.HO             AS                                                     "ho",
                        STU.TEN            AS                                                     "ten",
                        STU.EMAIL_CA_NHAN  AS                                                     "emailCaNhan",
                        STU.EMAIL_TRUONG   AS                                                     "emailTruong",
                        STU.NGAY_SINH      AS                                                     "ngaySinh",
                        STU.GIOI_TINH      AS                                                     "gioiTinh",
                        STU.DAN_TOC        AS                                                     "maDanToc",
                        STU.QUOC_GIA       AS                                                     "maQuocGia",
                        LSV.TEN            AS                                                     "loaiSinhVien",
                        LHDT.TEN           AS                                                     "loaiHinhDaoTao",
                        TTSV.TEN           AS                                                     "tinhTrangSinhVien",
                        STU.KHOA           AS                                                     "khoa",
                        TINHTHANH.TEN      AS                                                     "tinhThanhThuongTru",
                        KHOA.TEN           AS                                                     "tenKhoa",
                        STU.MA_NGANH       AS                                                     "maNganh",
                        STU.LOP            AS                                                     "lop",
                        TONGIAO.TEN        AS                                                     "tonGiao",
                        QG.TEN_QUOC_GIA    AS                                                     "quocTich",
                        DANTOC.TEN         AS                                                     "danToc",
                        STU.NAM_TUYEN_SINH AS                                                     "namTuyenSinh",
                        STU.NGAY_NHAP_HOC  AS                                                     "ngayNhapHoc",
                        ROW_NUMBER() OVER (ORDER BY STU.NAM_TUYEN_SINH DESC NULLS LAST, STU.TEN ) R
                 FROM FW_STUDENT STU
                          LEFT JOIN DM_SV_LOAI_HINH_DAO_TAO LHDT ON LHDT.MA = STU.LOAI_HINH_DAO_TAO
                          LEFT JOIN DM_LOAI_SINH_VIEN LSV on LSV.MA = STU.LOAI_SINH_VIEN
                          LEFT JOIN DM_GIOI_TINH GT ON GT.MA = STU.GIOI_TINH
                          LEFT JOIN DM_QUOC_GIA QG ON QG.MA_CODE = STU.QUOC_GIA
                          LEFT JOIN DM_DAN_TOC DANTOC ON DANTOC.MA = STU.DAN_TOC
                          LEFT JOIN DM_TON_GIAO TONGIAO ON TONGIAO.MA = STU.TON_GIAO
                          LEFT JOIN DM_TINH_THANH_PHO TINHTHANH ON TINHTHANH.MA = STU.THUONG_TRU_MA_TINH
                          LEFT JOIN DM_DON_VI KHOA ON KHOA.MA = STU.KHOA
                          LEFT JOIN DM_TINH_TRANG_SINH_VIEN TTSV ON TTSV.MA = STU.TINH_TRANG
                 WHERE (
                         (listFaculty IS NOT NULL AND STU.KHOA IN (SELECT regexp_substr(listFaculty, '[^,]+', 1, level)
                                                                   from dual
                                                                   connect by regexp_substr(listFaculty, '[^,]+', 1, level) is not null) OR
                          listFaculty IS NULL)
                         AND (listFromCity IS NOT NULL AND INSTR(listFromCity, STU.THUONG_TRU_MA_TINH) != 0 OR
                              listFromCity IS NULL)
                         AND (listEthnic IS NOT NULL AND INSTR(listEthnic, STU.DAN_TOC) != 0 OR listEthnic IS NULL)
                         AND (listNationality IS NOT NULL AND INSTR(listNationality, STU.QUOC_GIA) != 0 OR
                              listNationality IS NULL)
                         AND
                         (listReligion IS NOT NULL AND INSTR(listReligion, STU.DAN_TOC) != 0 OR listReligion IS NULL)
                         AND
                         (listLoaiHinhDaoTao IS NOT NULL AND INSTR(listLoaiHinhDaoTao, STU.LOAI_HINH_DAO_TAO) != 0 OR
                          listLoaiHinhDaoTao IS NULL)
                         AND (listLoaiSinhVien IS NOT NULL AND INSTR(listLoaiSinhVien, STU.LOAI_SINH_VIEN) != 0 OR
                              listLoaiSinhVien IS NULL)
                         AND (listTinhTrangSinhVien IS NOT NULL AND INSTR(listTinhTrangSinhVien, STU.TINH_TRANG) != 0 OR
                              listTinhTrangSinhVien IS NULL)
                         AND (gender IS NOT NULL AND ('0' + STU.GIOI_TINH) = gender OR gender IS NULL))
                   AND (searchTerm = ''
                     OR LOWER(STU.MSSV) LIKE sT
                     OR LOWER(TRIM(STU.HO || ' ' || STU.TEN)) LIKE sT
                     OR LOWER(STU.MA_NGANH) LIKE sT
                     OR LOWER(STU.LOP) LIKE sT
                     OR LOWER(STU.DIEN_THOAI_CA_NHAN) LIKE sT
                     OR LOWER(STU.DIEN_THOAI_LIEN_LAC) LIKE sT
                     OR LOWER(STU.EMAIL_CA_NHAN) LIKE sT)
                 ORDER BY STU.NAM_TUYEN_SINH DESC NULLS LAST, STU.TEN
             )
        WHERE R BETWEEN (pageNumber - 1) * pageSize + 1 AND pageNumber * pageSize;
    RETURN STUDENT_INFO;
end;

/
--EndMethod--

CREATE OR REPLACE FUNCTION "FW_USER_GET_USER_ROLES" (pemail in nvarchar2)
RETURN SYS_REFCURSOR
AS
my_cursor SYS_REFCURSOR;
BEGIN
    OPEN my_cursor FOR
        SELECT fw_role.id as "id", fw_role.name as "name", fw_role.permission as "permission"
        FROM fw_user_role, fw_role
        WHERE fw_user_role.email=pemail AND fw_user_role.role_id=fw_role.id AND fw_role.active=1;
    RETURN my_cursor;
END;

/
--EndMethod--

CREATE OR REPLACE FUNCTION GET_CHUC_VU_BY_TIME(maCanBo NVARCHAR2, timeX NUMBER) RETURN VARCHAR
AS
    result VARCHAR(32767);
BEGIN
    SELECT JSON_ARRAY (
        JSON_OBJECT(KEY 'stt' VALUE qtcv.STT),
        JSON_OBJECT(KEY 'maChucVu' VALUE TO_CHAR(qtcv.MA_CHUC_VU)),
        JSON_OBJECT(KEY 'ngayRaQd' VALUE qtcv.NGAY_RA_QD)
    ) INTO result
    FROM QT_CHUC_VU qtcv
    WHERE qtcv.SHCC = maCanBo and qtcv.NGAY_RA_QD <= timeX and qtcv.CHUC_VU_CHINH = 1;
    return result;
END;

/
--EndMethod--

CREATE OR REPLACE FUNCTION GET_NGUOI_DAI_DIEN_KY_HOP_DONG RETURN SYS_REFCURSOR
AS
    my_cursor SYS_REFCURSOR;
BEGIN
    OPEN my_cursor FOR
        SELECT
            cb.SHCC AS  "shcc",
            cb.HO   AS  "hoCanBo",
            cb.TEN  AS  "tenCanBo"
        FROM QT_CHUC_VU qtcv
             LEFT JOIN TCHC_CAN_BO cb on qtcv.SHCC = cb.SHCC
        WHERE (qtcv.MA_CHUC_VU = '001')
            OR (qtcv.MA_CHUC_VU = '003' AND qtcv.MA_DON_VI = '30');
    RETURN my_cursor;
END;

/
--EndMethod--

CREATE OR REPLACE FUNCTION HCTH_CAN_BO_KY_GET_ALL_FROM(
    congVanTrinhKy in number) RETURN SYS_REFCURSOR AS
    my_cursor SYS_REFCURSOR;
BEGIN
    OPEN my_cursor FOR
        SELECT hcthcbk.ID         as "id",
               hcthcbk.NGUOI_TAO  as "shccNguoiTao",
               hcthcbk.NGUOI_KY   as "nguoiKy",
               cbk.HO             as "hoCanBoNhan",
               cbk.TEN            as "tenCanBoNhan",
               nt.HO              as "hoNguoiTao",
               nt.TEN             as "tenNguoiTao",
               hcthcbk.TRANG_THAI as "trangThai"
        from HCTH_CAN_BO_KY hcthcbk
                 LEFT JOIN TCHC_CAN_BO cbk on hcthcbk.NGUOI_KY = cbk.SHCC
                 LEFT JOIN TCHC_CAN_BO nt on nt.SHCC = hcthcbk.NGUOI_TAO
        where (hcthcbk.CONG_VAN_TRINH_KY = congVanTrinhKy)
        order by hcthcbk.id;
    RETURN my_cursor;
END;

/
--EndMethod--

CREATE OR REPLACE FUNCTION HCTH_CAN_BO_KY_GET_LIST(
    congVanTrinhKy in number) RETURN SYS_REFCURSOR AS
    my_cursor SYS_REFCURSOR;
BEGIN
    OPEN my_cursor FOR
        SELECT hcthcbk.ID         as "id",
               hcthcbk.NGUOI_TAO  as "shccNguoiTao",
               hcthcbk.NGUOI_KY   as "nguoiKy",
               cbk.HO             as "hoCanBoNhan",
               cbk.TEN            as "tenCanBoNhan",
               nt.HO              as "hoNguoiTao",
               nt.TEN             as "tenNguoiTao",
               hcthcbk.TRANG_THAI as "trangThai"
        from HCTH_CAN_BO_KY hcthcbk
                 LEFT JOIN TCHC_CAN_BO cbk on hcthcbk.NGUOI_KY = cbk.SHCC
                 LEFT JOIN TCHC_CAN_BO nt on nt.SHCC = hcthcbk.NGUOI_TAO
        where (hcthcbk.CONG_VAN_TRINH_KY = congVanTrinhKy)
        order by hcthcbk.id;
    RETURN my_cursor;
END;

/
--EndMethod--

CREATE OR REPLACE FUNCTION HCTH_CAN_BO_NHAN_GET_ALL_FROM(
    target IN NUMBER,
    targetType in STRING,
    ids in STRING) RETURN SYS_REFCURSOR AS
    my_cursor SYS_REFCURSOR;
BEGIN
    OPEN my_cursor FOR
        SELECT hcthcbn.ID          as "id",
               hcthcbn.CAN_BO_NHAN as "shccCanBoNhan",
               hcthcbn.NGUOI_TAO   as "shccNguoiTao",
               hcthcbn.VAI_TRO     as "vaiTro",
               cbn.HO              as "hoCanBoNhan",
               cbn.TEN             as "tenCanBoNhan",
               nt.HO               as "hoNguoiTao",
               nt.TEN              as "tenNguoiTao",
               hcthcbn.TRANG_THAI  as "trangThai"
        from HCTH_CAN_BO_NHAN hcthcbn
                 LEFT JOIN TCHC_CAN_BO cbn on hcthcbn.CAN_BO_NHAN = cbn.SHCC
                 LEFT JOIN TCHC_CAN_BO nt on nt.SHCC = hcthcbn.NGUOI_TAO
        where ((ids is not null and hcthcbn.id in (select regexp_substr(ids, '[^,]+', 1, level)
                                                  from dual
                                                  connect by regexp_substr(ids, '[^,]+', 1, level) is not null))
           or (hcthcbn.MA is not null and ma is not null and hcthcbn.MA = target)) and hcthcbn.LOAI = targetType
        order by hcthcbn.VAI_TRO, hcthcbn.id;
    RETURN my_cursor;
END;

/
--EndMethod--

CREATE OR REPLACE FUNCTION HCTH_CHI_DAO_GET_CONG_VAN_CHI_DAO(
    idCongVan IN NUMBER,
    type in STRING
) RETURN SYS_REFCURSOR AS
    my_cursor SYS_REFCURSOR;
BEGIN

    OPEN my_cursor FOR
        SELECT distinct cd.id        as "id",
                        cd.CHI_DAO   as "chiDao",
                        cd.THOI_GIAN as "thoiGian",
                        cd.CAN_BO    as "canBo",
                        cb.HO        as "ho",
                        cb.TEN       as "ten",
                        DMCV.TEN     as "chucVu",
                        usr.IMAGE    AS "image",
                        cd.ACTION    AS "action"


        FROM HCTH_CHI_DAO cd
                 LEFT JOIN TCHC_CAN_BO cb on cd.CAN_BO = cb.SHCC
                 LEFT JOIN QT_CHUC_VU qtcv ON cb.SHCC = qtcv.SHCC AND CHUC_VU_CHINH = 1
                 LEFT JOIN DM_CHUC_VU DMCV ON DMCV.MA = qtcv.MA_CHUC_VU
                 LEFT JOIN FW_USER usr on usr.SHCC = cb.shcc
        WHERE idCongVan is not null
          and cd.CONG_VAN = idCongVan
          and cd.LOAI = type
        ORDER BY THOI_GIAN ASC;
    RETURN my_cursor;
END;

/
--EndMethod--

CREATE OR REPLACE FUNCTION HCTH_CONG_VAN_DEN_DOWNLOAD(
    donViGuiCV IN NUMBER,
    listDonVi in STRING,
    maCanBo IN STRING,
    timeType IN NUMBER,
    fromTime in NUMBER,
    toTime IN NUMBER,
    sortBy IN STRING,
    sortType in STRING,
    shccCanBo IN STRING,
    donViCanBo in STRING,
    staffType in NUMBER,
    status in NUMBER,
    searchTerm IN STRING,
    totalItem OUT NUMBER,
    pageTotal OUT NUMBER
) RETURN SYS_REFCURSOR AS
    my_cursor SYS_REFCURSOR;
    sT        STRING(500) := '%' || lower(searchTerm) || '%';
BEGIN
    SELECT COUNT(*)
    INTO totalItem
    FROM HCTH_CONG_VAN_DEN hcthcvd
             LEFT JOIN DM_DON_VI_GUI_CV dvgcv on hcthcvd.DON_VI_GUI = dvgcv.ID
    WHERE (
            (
                        donViGuiCV IS NULL
                    AND maCanBo IS NULL
                    AND listDonVi IS NULL
                )
            OR (
                        donViGuiCV IS NOT NULL
                    AND donViGuiCV = hcthcvd.DON_VI_GUI
                )
            OR (
                        maCanBo is NOT NULL
                    AND maCanBo in (SELECT regexp_substr(hcthcvd.CAN_BO_NHAN, '[^,]+', 1, level)
                                      from dual
                                      connect by regexp_substr(hcthcvd.CAN_BO_NHAN, '[^,]+', 1, level) is not null)
                )
            OR (
                        listDonVi IS NOT NULL
                    AND Exists(
                                select hcthdvn.id
                                from HCTH_DON_VI_NHAN hcthdvn
                                where hcthdvn.MA = hcthcvd.id
                                  and hcthdvn.LOAI = 'DEN'
                                  and hcthdvn.DON_VI_NHAN in
                                      (
                                          select regexp_substr(listDonVi, '[^,]+', 1, level)
                                          from dual
                                          connect by regexp_substr(listDonVi, '[^,]+', 1, level) is not null
                                      )
                            )
                ))
      AND (
                timeType is null
            or (
                            fromTime is null
                        and toTime is NUll
                    )
            or (
                            timeType IS NOT NULL
                        AND (
                                        fromTime is NULL
                                    OR (
                                                (
                                                            timeType = 1
                                                        AND hcthcvd.NGAY_CONG_VAN IS NOT NULL
                                                        AND hcthcvd.NGAY_CONG_VAN >= fromTime
                                                    )
                                                OR (
                                                            timeType = 2
                                                        AND hcthcvd.NGAY_NHAN IS NOT NULL
                                                        AND hcthcvd.NGAY_NHAN >= fromTime
                                                    )
                                                OR (
                                                            timeType = 3
                                                        AND hcthcvd.NGAY_HET_HAN IS NOT NULL
                                                        AND hcthcvd.NGAY_HET_HAN >= fromTime
                                                    )
                                            )
                                )
                        AND (
                                        toTime is NULL
                                    OR (
                                                (
                                                            timeType = 1
                                                        AND hcthcvd.NGAY_CONG_VAN IS NOT NULL
                                                        AND hcthcvd.NGAY_CONG_VAN <= toTime
                                                    )
                                                OR (
                                                            timeType = 2
                                                        AND hcthcvd.NGAY_NHAN IS NOT NULL
                                                        AND hcthcvd.NGAY_NHAN <= toTime
                                                    )
                                                OR (
                                                            timeType = 3
                                                        AND hcthcvd.NGAY_HET_HAN IS NOT NULL
                                                        AND hcthcvd.NGAY_HET_HAN <= toTime
                                                    )
                                            )
                                )
                    )
        )
      AND (
            (donViCanBo is null and shccCanBo is null) or
            (donViCanBo is not null and Exists(
                    select hcthdvn.id
                    from HCTH_DON_VI_NHAN hcthdvn
                    where hcthdvn.MA = hcthcvd.id
                      and hcthdvn.LOAI = 'DEN'
                      and hcthdvn.DON_VI_NHAN in
                          (
                              select regexp_substr(donViCanBo, '[^,]+', 1, level)
                              from dual
                              connect by regexp_substr(donViCanBo, '[^,]+', 1, level) is not null
                          )
                )
                )
            or (
                        shccCanBo is not null and
                        shccCanBo in (SELECT regexp_substr(hcthcvd.CAN_BO_NHAN, '[^,]+', 1, level)
                                      from dual
                                      connect by regexp_substr(hcthcvd.CAN_BO_NHAN, '[^,]+', 1, level) is not null)
                )
        )
      AND (
                sT is null
            OR LOWER(hcthcvd.SO_DEN) LIKE st
            OR LOWER(hcthcvd.TRICH_YEU) LIKE sT
            OR LOWER(hcthcvd.TRICH_YEU) LIKE sT
            OR LOWER(hcthcvd.SO_CONG_VAN) LIKE sT
            OR LOWER(dvgcv.TEN) LIKE sT
        )
      AND (
--           staffType : 0 - hcth, 1 - rector, 2 - staff
                staffType = 0 or
                (staffType = 1 and hcthcvd.TRANG_THAI != 0) or
                (staffType = 2 and hcthcvd.TRANG_THAI = 5)
        )
      AND (
        status is NULL or hcthcvd.TRANG_THAI = status
        );
--     IF pageNumber < 1 THEN
--         pageNumber := 1;
--     END IF;
--     IF pageSize < 1 THEN
--         pageSize := 1;
--     END IF;
--     pageTotal := CEIL(totalItem / pageSize);
--     pageNumber := LEAST(pageNumber, pageTotal);

    OPEN my_cursor FOR
        SELECT *
        FROM (
                 SELECT hcthcvd.ID            AS "id",
                        hcthcvd.SO_DEN        AS "soDen",
                        hcthcvd.NGAY_NHAN     AS "ngayNhan",
                        hcthcvd.TRICH_YEU     AS "trichYeu",
                        hcthcvd.NGAY_CONG_VAN AS "ngayCongVan",
                        hcthcvd.NGAY_HET_HAN  AS "ngayHetHan",
                        hcthcvd.SO_CONG_VAN   AS "soCongVan",
                        hcthcvd.CAN_BO_NHAN   AS "maCanBoNhan",
                        hcthcvd.TRANG_THAI    AS "trangThai",
                        dvgcv.ID              AS "maDonViGuiCV",
                        dvgcv.TEN             AS "tenDonViGuiCV",


                        (SELECT LISTAGG(hcthdvn.DON_VI_NHAN, ',') WITHIN GROUP (
                            order by hcthdvn.ID
                            )
                         FROM HCTH_DON_VI_NHAN hcthdvn
                         WHERE hcthdvn.MA = hcthcvd.ID
                           AND hcthdvn.LOAI = 'DEN'
                        )                     AS "maDonViNhan",


                        (SELECT LISTAGG(dvn.TEN, '; ') WITHIN GROUP (
                            order by dvn.TEN
                            )
                         FROM DM_DON_VI dvn
                                  LEFT JOIN HCTH_DON_VI_NHAN hcthdvn on dvn.MA = hcthdvn.DON_VI_NHAN
                         WHERE hcthdvn.MA = hcthcvd.ID
                           AND hcthdvn.LOAI = 'DEN'
                        )                     AS "danhSachDonViNhan",

                        (SELECT LISTAGG(hcthcd.CHI_DAO, '|') WITHIN GROUP (
                            order by hcthcd.CHI_DAO
                        )
                         FROM HCTH_CHI_DAO hcthcd
                                               WHERE hcthcd.LOAI = 'DEN' AND
                                                     hcthcd.CONG_VAN = hcthcvd.ID) AS "chiDao",

                        CASE
                            when hcthcvd.CAN_BO_NHAN is not null then
                                (
                                    SELECT LISTAGG(
                                                   CASE
                                                       WHEN cbn.HO IS NULL THEN cbn.TEN
                                                       WHEN cbn.TEN IS NULL THEN cbn.HO
                                                       WHEN DMCV.TEN IS NULL THEN CONCAT(CONCAT(cbn.HO, ' '), cbn.TEN)
                                                       ELSE CONCAT(CONCAT(CONCAT(DMCV.TEN, ' - '), CONCAT(cbn.HO, ' ')),
                                                                   cbn.TEN)
                                                       END,
                                                   '; '
                                               ) WITHIN GROUP (
                                                       order by cbn.TEN
                                                       ) as "hoVaTenCanBo"
                                    FROM TCHC_CAN_BO cbn
                                             LEFT JOIN QT_CHUC_VU qtcv ON cbn.SHCC = qtcv.SHCC AND CHUC_VU_CHINH = 1
                                             LEFT JOIN DM_CHUC_VU DMCV ON DMCV.MA = qtcv.MA_CHUC_VU
                                    WHERE cbn.SHCC in (SELECT regexp_substr(hcthcvd.CAN_BO_NHAN, '[^,]+', 1, level)
                                                       from dual
                                                       connect by regexp_substr(hcthcvd.CAN_BO_NHAN, '[^,]+', 1, level) is not null)
                                ) END         AS "danhSachCanBoNhan",


                        CASE
                            WHEN EXISTS(SELECT id
                                        FROM HCTH_CHI_DAO cd
                                        WHERE cd.CONG_VAN = hcthcvd.ID
                                          and cd.LOAI = 'DEN') then 1
                            ELSE 0
                            END               as "hasChiDao",

                        ROW_NUMBER() OVER (
                            ORDER BY
                                CASE
                                    WHEN sortType = 'DESC' THEN
                                        CASE
                                            when sortBy = 'NGAY_NHAN'
                                                then (CASE when hcthcvd.NGAY_NHAN is NULL THEN 0 ELSE hcthcvd.NGAY_NHAN end)
                                            when sortBy = 'NGAY_HET_HAN' then (CASE
                                                                                   when hcthcvd.NGAY_HET_HAN is NULL
                                                                                       THEN 0
                                                                                   ELSE hcthcvd.NGAY_HET_HAN end)
                                            when sortBy = 'TINH_TRANG'
                                                then CASE
                                                         when EXISTS(SELECT id
                                                                     FROM HCTH_CHI_DAO cd
                                                                     WHERE cd.CONG_VAN = hcthcvd.ID
                                                                       and cd.LOAI = 'DEN')
                                                             then 1
                                                         else 0 END
                                            ELSE 0 END
                                    ELSE 0 END DESC,
                                CASE
                                    WHEN sortType = 'ASC' THEN
                                        CASE
                                            when sortBy = 'NGAY_NHAN'
                                                then (CASE when hcthcvd.NGAY_NHAN is NULL THEN 0 ELSE hcthcvd.NGAY_NHAN end)
                                            when sortBy = 'NGAY_HET_HAN' then (CASE
                                                                                   when hcthcvd.NGAY_HET_HAN is NULL
                                                                                       THEN 0
                                                                                   ELSE hcthcvd.NGAY_HET_HAN end)
                                            when sortBy = 'TINH_TRANG'
                                                then CASE
                                                         when EXISTS(SELECT id
                                                                     FROM HCTH_CHI_DAO cd
                                                                     WHERE cd.CONG_VAN = hcthcvd.ID
                                                                       and cd.LOAI = 'DEN')
                                                             then 1
                                                         else 0 END
                                            ELSE 0 END
                                    ELSE 0 END,
                                hcthcvd.ID DESC
                            )                    R
                 FROM HCTH_CONG_VAN_DEN hcthcvd
                          LEFT JOIN DM_DON_VI_GUI_CV dvgcv on (hcthcvd.DON_VI_GUI = dvgcv.ID)
                 WHERE (
                         (
                                     donViGuiCV IS NULL
                                 AND maCanBo IS NULL
                                 AND listDonVi IS NULL
                             )
                         OR (
                                     donViGuiCV IS NOT NULL
                                 AND donViGuiCV = hcthcvd.DON_VI_GUI
                             )
                         OR (
                                     maCanBo is NOT NULL
                                 AND maCanBo in
                                     (
                                         select regexp_substr(hcthcvd.CAN_BO_NHAN, '[^,]+', 1, level)
                                         from dual
                                         connect by regexp_substr(hcthcvd.CAN_BO_NHAN, '[^,]+', 1, level) is not null
                                     )
                             )
                         OR (
                                     listDonVi IS NOT NULL
                                 AND Exists(
                                             select hcthdvn.id
                                             from HCTH_DON_VI_NHAN hcthdvn
                                             where hcthdvn.MA = hcthcvd.id
                                               and hcthdvn.LOAI = 'DEN'
                                               and hcthdvn.DON_VI_NHAN in
                                                   (
                                                       select regexp_substr(listDonVi, '[^,]+', 1, level)
                                                       from dual
                                                       connect by regexp_substr(listDonVi, '[^,]+', 1, level) is not null
                                                   )
                                         )
                             ))
                   AND (
                             timeType is null
                         or (
                                         fromTime is null
                                     and toTime is NUll
                                 )
                         or (
                                         timeType IS NOT NULL
                                     AND (
                                                     fromTime is NULL
                                                 OR (
                                                             (
                                                                         timeType = 1
                                                                     AND hcthcvd.NGAY_CONG_VAN IS NOT NULL
                                                                     AND hcthcvd.NGAY_CONG_VAN >= fromTime
                                                                 )
                                                             OR (
                                                                         timeType = 2
                                                                     AND hcthcvd.NGAY_NHAN IS NOT NULL
                                                                     AND hcthcvd.NGAY_NHAN >= fromTime
                                                                 )
                                                             OR (
                                                                         timeType = 3
                                                                     AND hcthcvd.NGAY_HET_HAN IS NOT NULL
                                                                     AND hcthcvd.NGAY_HET_HAN >= fromTime
                                                                 )
                                                         )
                                             )
                                     AND (
                                                     toTime is NULL
                                                 OR (
                                                             (
                                                                         timeType = 1
                                                                     AND hcthcvd.NGAY_CONG_VAN IS NOT NULL
                                                                     AND hcthcvd.NGAY_CONG_VAN <= toTime
                                                                 )
                                                             OR (
                                                                         timeType = 2
                                                                     AND hcthcvd.NGAY_NHAN IS NOT NULL
                                                                     AND hcthcvd.NGAY_NHAN <= toTime
                                                                 )
                                                             OR (
                                                                         timeType = 3
                                                                     AND hcthcvd.NGAY_HET_HAN IS NOT NULL
                                                                     AND hcthcvd.NGAY_HET_HAN <= toTime
                                                                 )
                                                         )
                                             )
                                 )
                     )
                   AND (
                         (donViCanBo is null and shccCanBo is null) or
                         (donViCanBo is not null and Exists(
                                 select hcthdvn.id
                                 from HCTH_DON_VI_NHAN hcthdvn
                                 where hcthdvn.MA = hcthcvd.id
                                   and hcthdvn.LOAI = 'DEN'
                                   and hcthdvn.DON_VI_NHAN in
                                       (
                                           select regexp_substr(donViCanBo, '[^,]+', 1, level)
                                           from dual
                                           connect by regexp_substr(donViCanBo, '[^,]+', 1, level) is not null
                                       )
                             )
                             )
                         or (
                                     shccCanBo is not null and
                                     shccCanBo in (SELECT regexp_substr(hcthcvd.CAN_BO_NHAN, '[^,]+', 1, level)
                                                   from dual
                                                   connect by regexp_substr(hcthcvd.CAN_BO_NHAN, '[^,]+', 1, level) is not null)
                             )
                     )
                   AND (
                             sT is null
                         OR LOWER(hcthcvd.SO_DEN) LIKE st
                         OR LOWER(hcthcvd.TRICH_YEU) LIKE sT
                         OR LOWER(hcthcvd.TRICH_YEU) LIKE sT
                         OR LOWER(hcthcvd.SO_CONG_VAN) LIKE sT
                         OR LOWER(dvgcv.TEN) LIKE sT
                     )
                   AND (
--           staffType : 0 - hcth, 1 - rector, 2 - normal staff
                             staffType = 0 or
                             (staffType = 1 and hcthcvd.TRANG_THAI != 0) or
                             (staffType = 2 and hcthcvd.TRANG_THAI = 5)
                     )
                   AND (
                     status is NULL or hcthcvd.TRANG_THAI = status
                     )
             )
        ORDER BY R;
    RETURN my_cursor;
END;

/
--EndMethod--

CREATE OR REPLACE function HCTH_CONG_VAN_DEN_GET_AUTHORIZED_STAFF RETURN SYS_REFCURSOR AS
    my_cursor SYS_REFCURSOR;
BEGIN
    OPEN my_cursor FOR
        SELECT cb.email as "email"
        from TCHC_CAN_BO cb
                 left join QT_CHUC_VU qtcv on qtcv.shcc = cb.SHCC and qtcv.CHUC_VU_CHINH = 1
        where cb.SHCC in (select fwar.NGUOI_DUOC_GAN from FW_ASSIGN_ROLE fwar where fwar.NHOM_ROLE = 'quanLyCongVanDen')

           OR (qtcv.MA_CHUC_VU = '003' AND qtcv.MA_DON_VI = '29');
    RETURN my_cursor;
END ;

/
--EndMethod--

CREATE OR REPLACE FUNCTION HCTH_CONG_VAN_DEN_GET_NOTIFICATION(
    expireTime in number
) RETURN SYS_REFCURSOR AS
    my_cursor SYS_REFCURSOR;
BEGIN

    OPEN my_cursor FOR
        SELECT cvd.id          as "id",
               cvd.CAN_BO_NHAN as "maCanBoNhan",

               (SELECT LISTAGG(hcthdvn.DON_VI_NHAN, ',') WITHIN GROUP (
                   order by hcthdvn.ID
                   ) ICATION
                FROM HCTH_DON_VI_NHAN hcthdvn
                WHERE hcthdvn.MA = cvd.ID
                  AND hcthdvn.LOAI = 'DEN'
               )               AS "maDonViNhan"
        FROM HCTH_CONG_VAN_DEN cvd
        WHERE cvd.NGAY_HET_HAN is not null
          and cvd.NGAY_HET_HAN > 0
          and cvd.NHAC_NHO = 0
          and cvd.NGAY_HET_HAN < expireTime
          and cvd.TRANG_THAI > 0;
    RETURN my_cursor;
END;

/
--EndMethod--

CREATE OR REPLACE function HCTH_CONG_VAN_DEN_GET_RELATED_STAFF(
    key in NUMBER
) RETURN SYS_REFCURSOR
AS
    my_cursor SYS_REFCURSOR;
    canBoNhan STRING(255);
BEGIN
    select cvd.CAN_BO_NHAN into canBoNhan from HCTH_CONG_VAN_DEN cvd where cvd.id = key;

    OPEN my_cursor FOR
        SELECT unique cb.email as "email"
        from TCHC_CAN_BO cb
                 LEFT JOIN QT_CHUC_VU qtcv on qtcv.SHCC = cb.SHCC and qtcv.CHUC_VU_CHINH = 1
        where cb.shcc in (
            select regexp_substr(canBoNhan, '[^,]+', 1, level)
            from dual
            connect by regexp_substr(canBoNhan, '[^,]+', 1, level) is not null
        )
           OR (qtcv.MA_CHUC_VU in ('013', '005', '003', '016', '009', '007') AND qtcv.MA_DON_VI IN (
            SELECT dvn.DON_VI_NHAN
            FROM HCTH_DON_VI_NHAN dvn
            WHERE dvn.LOAI = 'DEN'
              and dvn.MA = key)
            );

    RETURN my_cursor;
END ;

/
--EndMethod--

CREATE OR REPLACE FUNCTION HCTH_CONG_VAN_DEN_SEARCH_PAGE(
    pageNumber IN OUT NUMBER,
    pageSize IN OUT NUMBER,
    donViGuiCV IN NUMBER,
    listDonVi in STRING,
    maCanBo IN STRING,
    timeType IN NUMBER,
    fromTime in NUMBER,
    toTime IN NUMBER,
    sortBy IN STRING,
    sortType in STRING,
    shccCanBo IN STRING,
    donViCanBo in STRING,
    staffType in NUMBER,
    status in NUMBER,
    searchTerm IN STRING,
    totalItem OUT NUMBER,
    pageTotal OUT NUMBER
) RETURN SYS_REFCURSOR AS
    my_cursor SYS_REFCURSOR;
    sT        STRING(500) := '%' || lower(searchTerm) || '%';
BEGIN
    SELECT COUNT(*)
    INTO totalItem
    FROM HCTH_CONG_VAN_DEN hcthcvd
             LEFT JOIN DM_DON_VI_GUI_CV dvgcv on hcthcvd.DON_VI_GUI = dvgcv.ID
    WHERE (
            (
                    donViGuiCV IS NULL
                    AND maCanBo IS NULL
                    AND listDonVi IS NULL
                )
            OR (
                    donViGuiCV IS NOT NULL
                    AND donViGuiCV = hcthcvd.DON_VI_GUI
                )
            OR (
                    maCanBo is NOT NULL
                    AND maCanBo in (SELECT regexp_substr(hcthcvd.CAN_BO_NHAN, '[^,]+', 1, level)
                                    from dual
                                    connect by regexp_substr(hcthcvd.CAN_BO_NHAN, '[^,]+', 1, level) is not null)
                )
            OR (
                    listDonVi IS NOT NULL
                    AND Exists(
                            select hcthdvn.id
                            from HCTH_DON_VI_NHAN hcthdvn
                            where hcthdvn.MA = hcthcvd.id
                              and hcthdvn.LOAI = 'DEN'
                              and hcthdvn.DON_VI_NHAN in
                                  (select regexp_substr(listDonVi, '[^,]+', 1, level)
                                   from dual
                                   connect by regexp_substr(listDonVi, '[^,]+', 1, level) is not null)
                        )
                ))
      AND (
            timeType is null
            or (
                    fromTime is null
                    and toTime is NUll
                )
            or (
                    timeType IS NOT NULL
                    AND (
                            fromTime is NULL
                            OR (
                                    (
                                                timeType = 1
                                            AND hcthcvd.NGAY_CONG_VAN IS NOT NULL
                                            AND hcthcvd.NGAY_CONG_VAN >= fromTime
                                        )
                                    OR (
                                                timeType = 2
                                            AND hcthcvd.NGAY_NHAN IS NOT NULL
                                            AND hcthcvd.NGAY_NHAN >= fromTime
                                        )
                                    OR (
                                                timeType = 3
                                            AND hcthcvd.NGAY_HET_HAN IS NOT NULL
                                            AND hcthcvd.NGAY_HET_HAN >= fromTime
                                        )
                                )
                        )
                    AND (
                            toTime is NULL
                            OR (
                                    (
                                                timeType = 1
                                            AND hcthcvd.NGAY_CONG_VAN IS NOT NULL
                                            AND hcthcvd.NGAY_CONG_VAN <= toTime
                                        )
                                    OR (
                                                timeType = 2
                                            AND hcthcvd.NGAY_NHAN IS NOT NULL
                                            AND hcthcvd.NGAY_NHAN <= toTime
                                        )
                                    OR (
                                                timeType = 3
                                            AND hcthcvd.NGAY_HET_HAN IS NOT NULL
                                            AND hcthcvd.NGAY_HET_HAN <= toTime
                                        )
                                )
                        )
                )
        )
      AND (
            (donViCanBo is null and shccCanBo is null) or
            (donViCanBo is not null and Exists(
                    select hcthdvn.id
                    from HCTH_DON_VI_NHAN hcthdvn
                    where hcthdvn.MA = hcthcvd.id
                      and hcthdvn.LOAI = 'DEN'
                      and hcthdvn.DON_VI_NHAN in
                          (select regexp_substr(donViCanBo, '[^,]+', 1, level)
                           from dual
                           connect by regexp_substr(donViCanBo, '[^,]+', 1, level) is not null)
                )
                )
            or (
                    shccCanBo is not null and
                    shccCanBo in (SELECT regexp_substr(hcthcvd.CAN_BO_NHAN, '[^,]+', 1, level)
                                  from dual
                                  connect by regexp_substr(hcthcvd.CAN_BO_NHAN, '[^,]+', 1, level) is not null)
                )
        )
      AND (
            sT is null
            OR LOWER(hcthcvd.SO_DEN) LIKE st
            OR LOWER(hcthcvd.TRICH_YEU) LIKE sT
            OR LOWER(hcthcvd.TRICH_YEU) LIKE sT
            OR LOWER(hcthcvd.SO_CONG_VAN) LIKE sT
            OR LOWER(dvgcv.TEN) LIKE sT
        )
      AND (
--           staffType : 0 - hcth, 1 - rector, 2 - staff
                staffType = 0 or
                (staffType = 1 and hcthcvd.TRANG_THAI != 0) or
                (staffType = 2 and hcthcvd.TRANG_THAI = 5)
        )
      AND (
        status is NULL or hcthcvd.TRANG_THAI = status
        );
    IF pageNumber < 1 THEN
        pageNumber := 1;
    END IF;
    IF pageSize < 1 THEN
        pageSize := 1;
    END IF;
    pageTotal := CEIL(totalItem / pageSize);
    pageNumber := LEAST(pageNumber, pageTotal);

    OPEN my_cursor FOR
        SELECT *
        FROM (SELECT hcthcvd.ID                                                                                                     AS "id",
                     hcthcvd.SO_DEN                                                                                                 AS "soDen",
                     hcthcvd.NGAY_NHAN                                                                                              AS "ngayNhan",
                     hcthcvd.TRICH_YEU                                                                                              AS "trichYeu",
                     hcthcvd.NGAY_CONG_VAN                                                                                          AS "ngayCongVan",
                     hcthcvd.NGAY_HET_HAN                                                                                           AS "ngayHetHan",
                     hcthcvd.SO_CONG_VAN                                                                                            AS "soCongVan",
                     hcthcvd.CAN_BO_NHAN                                                                                            AS "maCanBoNhan",
                     hcthcvd.TRANG_THAI                                                                                             AS "trangThai",
                     dvgcv.ID                                                                                                       AS "maDonViGuiCV",
                     dvgcv.TEN                                                                                                      AS "tenDonViGuiCV",
                     hcthcvd.CAP_NHAT_LUC                                                                                           AS "capNhatLuc",


                     (SELECT LISTAGG(hcthdvn.DON_VI_NHAN, ',') WITHIN GROUP (
                         order by hcthdvn.ID
                         )
                      FROM HCTH_DON_VI_NHAN hcthdvn
                      WHERE hcthdvn.MA = hcthcvd.ID
                        AND hcthdvn.LOAI = 'DEN')                                                                                   AS "maDonViNhan",


                     (SELECT LISTAGG(dvn.TEN, '; ') WITHIN GROUP (
                         order by dvn.TEN
                         )
                      FROM DM_DON_VI dvn
                               LEFT JOIN HCTH_DON_VI_NHAN hcthdvn on dvn.MA = hcthdvn.DON_VI_NHAN
                      WHERE hcthdvn.MA = hcthcvd.ID
                        AND hcthdvn.LOAI = 'DEN')                                                                                   AS "danhSachDonViNhan",


                     CASE
                         when hcthcvd.CAN_BO_NHAN is not null then
                             (SELECT LISTAGG(
                                             CASE
                                                 WHEN cbn.HO IS NULL THEN cbn.TEN
                                                 WHEN cbn.TEN IS NULL THEN cbn.HO
                                                 WHEN DMCV.TEN IS NULL THEN CONCAT(CONCAT(cbn.HO, ' '), cbn.TEN)
                                                 ELSE CONCAT(CONCAT(CONCAT(DMCV.TEN, ' - '), CONCAT(cbn.HO, ' ')),
                                                             cbn.TEN)
                                                 END,
                                             '; '
                                         ) WITHIN GROUP (
                                                 order by cbn.TEN
                                                 ) as "hoVaTenCanBo"
                              FROM TCHC_CAN_BO cbn
                                       LEFT JOIN QT_CHUC_VU qtcv ON cbn.SHCC = qtcv.SHCC AND CHUC_VU_CHINH = 1
                                       LEFT JOIN DM_CHUC_VU DMCV ON DMCV.MA = qtcv.MA_CHUC_VU
                              WHERE cbn.SHCC in (SELECT regexp_substr(hcthcvd.CAN_BO_NHAN, '[^,]+', 1, level)
                                                 from dual
                                                 connect by regexp_substr(hcthcvd.CAN_BO_NHAN, '[^,]+', 1, level) is not null)) END AS "danhSachCanBoNhan",


                     CASE
                         WHEN EXISTS(SELECT id
                                     FROM HCTH_CHI_DAO cd
                                     WHERE cd.CONG_VAN = hcthcvd.ID
                                       and cd.LOAI = 'DEN') then 1
                         ELSE 0
                         END                                                                                                        as "hasChiDao",

                     ROW_NUMBER() OVER (
                         ORDER BY
                             CASE
                                 WHEN sortType = 'DESC' THEN
                                     CASE
                                         when sortBy = 'NGAY_NHAN'
                                             then (CASE when hcthcvd.NGAY_NHAN is NULL THEN 0 ELSE hcthcvd.NGAY_NHAN end)
                                         when sortBy = 'NGAY_HET_HAN' then (CASE
                                                                                when hcthcvd.NGAY_HET_HAN is NULL
                                                                                    THEN 0
                                                                                ELSE hcthcvd.NGAY_HET_HAN end)
                                         when sortBy = 'TINH_TRANG'
                                             then CASE
                                                      when EXISTS(SELECT id
                                                                  FROM HCTH_CHI_DAO cd
                                                                  WHERE cd.CONG_VAN = hcthcvd.ID
                                                                    and cd.LOAI = 'DEN')
                                                          then 1
                                                      else 0 END
                                         when sortBy = 'CAP_NHAT' then hcthcvd.CAP_NHAT_LUC

                                         ELSE 0 END
                                 ELSE 0 END DESC,
                             CASE
                                 WHEN sortType = 'ASC' THEN
                                     CASE
                                         when sortBy = 'NGAY_NHAN'
                                             then (CASE when hcthcvd.NGAY_NHAN is NULL THEN 0 ELSE hcthcvd.NGAY_NHAN end)
                                         when sortBy = 'NGAY_HET_HAN' then (CASE
                                                                                when hcthcvd.NGAY_HET_HAN is NULL
                                                                                    THEN 0
                                                                                ELSE hcthcvd.NGAY_HET_HAN end)
                                         when sortBy = 'TINH_TRANG'
                                             then CASE
                                                      when EXISTS(SELECT id
                                                                  FROM HCTH_CHI_DAO cd
                                                                  WHERE cd.CONG_VAN = hcthcvd.ID
                                                                    and cd.LOAI = 'DEN')
                                                          then 1
                                                      else 0 END
                                         when sortBy = 'CAP_NHAT' then hcthcvd.CAP_NHAT_LUC
                                         ELSE 0 END
                                 ELSE 0 END,
                             hcthcvd.ID DESC
                         )                                                                                                             R
              FROM HCTH_CONG_VAN_DEN hcthcvd
                       LEFT JOIN DM_DON_VI_GUI_CV dvgcv on (hcthcvd.DON_VI_GUI = dvgcv.ID)
              WHERE (
                      (
                              donViGuiCV IS NULL
                              AND maCanBo IS NULL
                              AND listDonVi IS NULL
                          )
                      OR (
                              donViGuiCV IS NOT NULL
                              AND donViGuiCV = hcthcvd.DON_VI_GUI
                          )
                      OR (
                              maCanBo is NOT NULL
                              AND maCanBo in
                                  (select regexp_substr(hcthcvd.CAN_BO_NHAN, '[^,]+', 1, level)
                                   from dual
                                   connect by regexp_substr(hcthcvd.CAN_BO_NHAN, '[^,]+', 1, level) is not null)
                          )
                      OR (
                              listDonVi IS NOT NULL
                              AND Exists(
                                      select hcthdvn.id
                                      from HCTH_DON_VI_NHAN hcthdvn
                                      where hcthdvn.MA = hcthcvd.id
                                        and hcthdvn.LOAI = 'DEN'
                                        and hcthdvn.DON_VI_NHAN in
                                            (select regexp_substr(listDonVi, '[^,]+', 1, level)
                                             from dual
                                             connect by regexp_substr(listDonVi, '[^,]+', 1, level) is not null)
                                  )
                          ))
                AND (
                      timeType is null
                      or (
                              fromTime is null
                              and toTime is NUll
                          )
                      or (
                              timeType IS NOT NULL
                              AND (
                                      fromTime is NULL
                                      OR (
                                              (
                                                          timeType = 1
                                                      AND hcthcvd.NGAY_CONG_VAN IS NOT NULL
                                                      AND hcthcvd.NGAY_CONG_VAN >= fromTime
                                                  )
                                              OR (
                                                          timeType = 2
                                                      AND hcthcvd.NGAY_NHAN IS NOT NULL
                                                      AND hcthcvd.NGAY_NHAN >= fromTime
                                                  )
                                              OR (
                                                          timeType = 3
                                                      AND hcthcvd.NGAY_HET_HAN IS NOT NULL
                                                      AND hcthcvd.NGAY_HET_HAN >= fromTime
                                                  )
                                          )
                                  )
                              AND (
                                      toTime is NULL
                                      OR (
                                              (
                                                          timeType = 1
                                                      AND hcthcvd.NGAY_CONG_VAN IS NOT NULL
                                                      AND hcthcvd.NGAY_CONG_VAN <= toTime
                                                  )
                                              OR (
                                                          timeType = 2
                                                      AND hcthcvd.NGAY_NHAN IS NOT NULL
                                                      AND hcthcvd.NGAY_NHAN <= toTime
                                                  )
                                              OR (
                                                          timeType = 3
                                                      AND hcthcvd.NGAY_HET_HAN IS NOT NULL
                                                      AND hcthcvd.NGAY_HET_HAN <= toTime
                                                  )
                                          )
                                  )
                          )
                  )
                AND (
                      (donViCanBo is null and shccCanBo is null) or
                      (donViCanBo is not null and Exists(
                              select hcthdvn.id
                              from HCTH_DON_VI_NHAN hcthdvn
                              where hcthdvn.MA = hcthcvd.id
                                and hcthdvn.LOAI = 'DEN'
                                and hcthdvn.DON_VI_NHAN in
                                    (select regexp_substr(donViCanBo, '[^,]+', 1, level)
                                     from dual
                                     connect by regexp_substr(donViCanBo, '[^,]+', 1, level) is not null)
                          )
                          )
                      or (
                              shccCanBo is not null and
                              shccCanBo in (SELECT regexp_substr(hcthcvd.CAN_BO_NHAN, '[^,]+', 1, level)
                                            from dual
                                            connect by regexp_substr(hcthcvd.CAN_BO_NHAN, '[^,]+', 1, level) is not null)
                          )
                  )
                AND (
                      sT is null
                      OR LOWER(hcthcvd.SO_DEN) LIKE st
                      OR LOWER(hcthcvd.TRICH_YEU) LIKE sT
                      OR LOWER(hcthcvd.TRICH_YEU) LIKE sT
                      OR LOWER(hcthcvd.SO_CONG_VAN) LIKE sT
                      OR LOWER(dvgcv.TEN) LIKE sT
                  )
                AND (
--           staffType : 0 - hcth, 1 - rector, 2 - normal staff
                          staffType = 0 or
                          (staffType = 1 and hcthcvd.TRANG_THAI != 0) or
                          (staffType = 2 and hcthcvd.TRANG_THAI = 5)
                  )
                AND (
                  status is NULL or hcthcvd.TRANG_THAI = status
                  ))
        WHERE R BETWEEN (pageNumber - 1) * pageSize + 1 AND pageNumber * pageSize
        ORDER BY R;
    RETURN my_cursor;
END;

/
--EndMethod--

CREATE OR REPLACE FUNCTION HCTH_CONG_VAN_DEN_SEARCH_SELECTOR(
    pageNumber IN OUT NUMBER,
    pageSize IN OUT NUMBER,
    filterParam in STRING,
    searchTerm IN STRING,
    totalItem OUT NUMBER,
    pageTotal OUT NUMBER
) RETURN SYS_REFCURSOR AS
    my_cursor  SYS_REFCURSOR;
    sT         STRING(500) := '%' || lower(searchTerm) || '%';
    donViCanBo STRING(24);
    shccCanBo  STRING(24);
    fromTime   NUMBER(20);
    toTime     NUMBER(20);
    staffType  STRING(16);
    ids        STRING(64);
    hasIds     NUMBER(1);
    excludeIds STRING(64);

BEGIN

    SELECT JSON_VALUE(filterParam, '$.donViCanBo') INTO donViCanBo FROM DUAL;
    SELECT JSON_VALUE(filterParam, '$.shccCanBo') INTO shccCanBo FROM DUAL;
    SELECT JSON_VALUE(filterParam, '$.fromTime') INTO fromTime FROM DUAL;
    SELECT JSON_VALUE(filterParam, '$.toTime') INTO toTime FROM DUAL;
    SELECT JSON_VALUE(filterParam, '$.staffType') INTO staffType FROM DUAL;
    SELECT JSON_VALUE(filterParam, '$.ids') INTO ids FROM DUAL;
    SELECT JSON_VALUE(filterParam, '$.excludeIds') INTO excludeIds FROM DUAL;
    SELECT JSON_VALUE(filterParam, '$.hasIds') INTO hasIds FROM DUAL;


    SELECT COUNT(*)
    INTO totalItem
    FROM HCTH_CONG_VAN_DEN hcthcvd
             LEFT JOIN DM_DON_VI_GUI_CV dvgcv on hcthcvd.DON_VI_GUI = dvgcv.ID
    WHERE
      -- condition check
        (
                    staffType = 'HCTH' or
                    (staffType = 'RECTOR' and hcthcvd.TRANG_THAI != 0) or
                    (hcthcvd.TRANG_THAI = 5
                        and ((
                                     donViCanBo is not null and Exists(select hcthdvn.id
                                                                       from HCTH_DON_VI_NHAN hcthdvn
                                                                       where hcthdvn.MA = hcthcvd.id
                                                                         and hcthdvn.LOAI = 'DEN'
                                                                         and hcthdvn.DON_VI_NHAN in
                                                                             (select regexp_substr(donViCanBo, '[^,]+', 1, level)
                                                                              from dual
                                                                              connect by regexp_substr(donViCanBo, '[^,]+', 1, level) is not null)))
                            or (
                                     shccCanBo is not null and
                                     shccCanBo in (SELECT regexp_substr(hcthcvd.CAN_BO_NHAN, '[^,]+', 1, level)
                                                   from dual
                                                   connect by regexp_substr(hcthcvd.CAN_BO_NHAN, '[^,]+', 1, level) is not null)
                                 )
                         )
                        )
            ) --filter
      and (fromTime is null or (hcthcvd.NGAY_CONG_VAN is not null and hcthcvd.NGAY_CONG_VAN > fromTime))
      AND (toTime is null or (hcthcvd.NGAY_CONG_VAN is not null and hcthcvd.NGAY_CONG_VAN < toTime))
      AND (
            sT is null
            OR LOWER(hcthcvd.SO_DEN) LIKE sT
            OR LOWER(hcthcvd.TRICH_YEU) LIKE sT
            OR LOWER(hcthcvd.SO_CONG_VAN) LIKE sT
            OR LOWER(dvgcv.TEN) LIKE sT
        )
      AND (hasIds = 0  or hcthcvd.id in (select regexp_substr(ids, '[^,]+', 1, level)
                                         from dual
                                         connect by regexp_substr(ids, '[^,]+', 1, level) is not null))
      AND (excludeIds is NUll or hcthcvd.id not in (select regexp_substr(excludeIds, '[^,]+', 1, level)
                                                    from dual
                                                    connect by regexp_substr(excludeIds, '[^,]+', 1, level) is not null));
    IF pageNumber < 1 THEN
        pageNumber := 1;
    END IF;
    IF pageSize < 1 THEN
        pageSize := 1;
    END IF;
    pageTotal := CEIL(totalItem / pageSize);
    pageNumber := LEAST(pageNumber, pageTotal);

    OPEN my_cursor FOR
        SELECT *
        FROM (SELECT hcthcvd.ID            AS                     "id",
                     hcthcvd.SO_DEN        AS                     "soDen",
                     hcthcvd.NGAY_NHAN     AS                     "ngayNhan",
                     hcthcvd.TRICH_YEU     AS                     "trichYeu",
                     hcthcvd.NGAY_CONG_VAN AS                     "ngayCongVan",
                     hcthcvd.NGAY_HET_HAN  AS                     "ngayHetHan",
                     hcthcvd.SO_CONG_VAN   AS                     "soCongVan",
                     hcthcvd.CAN_BO_NHAN   AS                     "maCanBoNhan",
                     hcthcvd.TRANG_THAI    AS                     "trangThai",
                     dvgcv.ID              AS                     "maDonViGuiCV",
                     dvgcv.TEN             AS                     "tenDonViGuiCV",

                     ROW_NUMBER() OVER (ORDER BY hcthcvd.ID DESC) R
              FROM HCTH_CONG_VAN_DEN hcthcvd
                       LEFT JOIN DM_DON_VI_GUI_CV dvgcv on (hcthcvd.DON_VI_GUI = dvgcv.ID)
              WHERE
                -- condition check
                  (
                              staffType = 'HCTH' or
                              (staffType = 'RECTOR' and hcthcvd.TRANG_THAI != 0) or
                              (hcthcvd.TRANG_THAI = 5
                                  and ((
                                               donViCanBo is not null and Exists(select hcthdvn.id
                                                                                 from HCTH_DON_VI_NHAN hcthdvn
                                                                                 where hcthdvn.MA = hcthcvd.id
                                                                                   and hcthdvn.LOAI = 'DEN'
                                                                                   and hcthdvn.DON_VI_NHAN in
                                                                                       (select regexp_substr(donViCanBo, '[^,]+', 1, level)
                                                                                        from dual
                                                                                        connect by regexp_substr(donViCanBo, '[^,]+', 1, level) is not null)))
                                      or (
                                               shccCanBo is not null and
                                               shccCanBo in
                                               (SELECT regexp_substr(hcthcvd.CAN_BO_NHAN, '[^,]+', 1, level)
                                                from dual
                                                connect by regexp_substr(hcthcvd.CAN_BO_NHAN, '[^,]+', 1, level) is not null)
                                           )
                                   )
                                  )
                      ) --filter
                and (fromTime is null or (hcthcvd.NGAY_CONG_VAN is not null and hcthcvd.NGAY_CONG_VAN > fromTime))
                AND (toTime is null or (hcthcvd.NGAY_CONG_VAN is not null and hcthcvd.NGAY_CONG_VAN < toTime))
                AND (
                      sT is null
                      OR LOWER(hcthcvd.SO_DEN) LIKE sT
                      OR LOWER(hcthcvd.TRICH_YEU) LIKE sT
                      OR LOWER(hcthcvd.SO_CONG_VAN) LIKE sT
                      OR LOWER(dvgcv.TEN) LIKE sT
                  )
                AND (hasIds = 0  or hcthcvd.id in (select regexp_substr(ids, '[^,]+', 1, level)
                                                   from dual
                                                   connect by regexp_substr(ids, '[^,]+', 1, level) is not null))
                AND (excludeIds is NUll or hcthcvd.id not in (select regexp_substr(excludeIds, '[^,]+', 1, level)
                                                              from dual
                                                              connect by regexp_substr(excludeIds, '[^,]+', 1, level) is not null)))
        WHERE R BETWEEN (pageNumber - 1) * pageSize + 1 AND pageNumber * pageSize
        ORDER BY R;
    RETURN my_cursor;
END ;

/
--EndMethod--

CREATE OR REPLACE FUNCTION HCTH_CONG_VAN_DI_DOWNLOAD_EXCEL(
    maCanBo IN STRING,
    donViGui IN NUMBER,
    donVi IN NUMBER,
    loaiCongVan IN NUMBER,
    loaiVanBan IN STRING,
    donViNhanNgoai IN NUMBER,
    donViXem IN STRING,
    canBoXem IN STRING,
    loaiCanBo IN NUMBER,
    status IN STRING,
    timeType IN NUMBER,
    fromTime IN NUMBER,
    toTime IN NUMBER,
    searchTerm IN STRING,
    totalItem OUT NUMBER
) RETURN SYS_REFCURSOR
AS
    CVD_INFO SYS_REFCURSOR;
    ST       STRING(500) := '%' || lower(searchTerm) || '%';
BEGIN
    SELECT COUNT(*)
    INTO totalItem
    FROM HCTH_CONG_VAN_DI hcthCVD
             LEFT JOIN DM_DON_VI dvg on (hcthCVD.DON_VI_GUI = dvg.MA)
    WHERE (
                  ((
                               donViGui IS NULL
                           OR (
                                           donViGui IS NOT NULL
                                       AND donViGui = hcthCVD.DON_VI_GUI
                                   )
                       )
                      AND (
                               maCanBo IS NULL
                           OR (
                                           maCanBo IS NOT NULL
                                       AND maCanBo IN
                                           (SELECT regexp_substr(hcthCVD.CAN_BO_NHAN, '[^,]+', 1, level)
                                            from dual
                                            connect by regexp_substr(hcthCVD.CAN_BO_NHAN, '[^,]+', 1, level) is NOT NULL
                                           )
                                   )
                       )
                      AND (
                               donVi IS NULL
                           OR (
                                           donVi IS NOT NULL
                                       AND EXISTS(
                                                   SELECT hcthDVN.id
                                                   FROM HCTH_DON_VI_NHAN hcthDVN
                                                   WHERE hcthDVN.MA = hcthCVD.ID
                                                     AND hcthDVN.LOAI = 'DI'
                                                     AND hcthDVN.DON_VI_NHAN_NGOAI = 0
                                                     AND hcthDVN.DON_VI_NHAN IN (
                                                       select regexp_substr(donVi, '[^,]+', 1, level)
                                                       from dual
                                                       connect by regexp_substr(donVi, '[^,]+', 1, level) is not null
                                                   )
                                               )
                                   )
                       )
                      AND (
                               donViNhanNgoai IS NULL
                           OR (
                                           donViNhanNgoai IS NOT NULL
                                       AND EXISTS(
                                                   SELECT hcthDVN.id
                                                   FROM HCTH_DON_VI_NHAN hcthDVN
                                                   WHERE hcthDVN.MA = hcthCVD.ID
                                                     AND hcthDVN.LOAI = 'DI'
                                                     AND hcthDVN.DON_VI_NHAN_NGOAI = 1
                                                     AND hcthDVN.DON_VI_NHAN IN (
                                                       select regexp_substr(donViNhanNgoai, '[^,]+', 1, level)
                                                       from dual
                                                       connect by regexp_substr(donViNhanNgoai, '[^,]+', 1, level) is not null
                                                   )
                                               )
                                   )
                       ))
                  AND (
                              loaiCongVan IS NULL
                          OR (
                                      (
                                                  loaiCongVan = 1
                                              AND hcthCVD.LOAI_CONG_VAN IS NOT NULL
                                              AND hcthCVD.LOAI_CONG_VAN = 'DON_VI'
                                          )
                                      OR (
                                                  loaiCongVan = 2
                                              AND hcthCVD.LOAI_CONG_VAN IS NOT NULL
                                              AND hcthCVD.LOAI_CONG_VAN = 'TRUONG'
                                          )
                                  )
                      )
                  AND (
                          (donViXem IS NULL AND canBoXem IS NULL)
                          OR (donViXem IS NOT NULL AND hcthCVD.DON_VI_GUI IN
                                                       (
                                                           SELECT regexp_substr(donViXem, '[^,]+', 1, level)
                                                           from dual
                                                           connect by regexp_substr(donViXem, '[^,]+', 1, level) is NOT NULL
                                                       )
                              )
                          OR (donViXem IS NOT NULL AND EXISTS(
                              SELECT hcthDVN.ID
                              FROM HCTH_DON_VI_NHAN hcthDVN
                              WHERE hcthDVN.MA = hcthCVD.ID
                                AND hcthDVN.LOAI = 'DI'
                                AND hcthDVN.DON_VI_NHAN IN
                                    (
                                        select regexp_substr(donViXem, '[^,]+', 1, level)
                                        from dual
                                        connect by regexp_substr(donViXem, '[^,]+', 1, level) is not null
                                    )
                          )
                          AND hcthCVD.TRANG_THAI != '1'
                          AND hcthCVD.TRANG_THAI != '4'
                              )
                          OR
                          (canBoXem IS NOT NULL AND canBoXem IN
                                                    (
                                                        SELECT regexp_substr(hcthCVD.CAN_BO_NHAN, '[^,]+', 1, level)
                                                        from dual
                                                        connect by regexp_substr(hcthCVD.CAN_BO_NHAN, '[^,]+', 1, level) is NOT NULL
                                                    )
                              AND hcthCVD.TRANG_THAI != '1'
                              )
                      )
                  AND (
                              loaiCanBo = 0 -- staff
                          OR (
                                          loaiCanBo = 1 -- rector
                                      AND (
                                                      hcthCVD.TRANG_THAI != '1'
                                                  OR hcthCVD.TRANG_THAI IS NULL
                                              )
                                  )
                          OR (
                                          loaiCanBo = 2 -- hcth
                                      AND (
                                                  (hcthCVD.TRANG_THAI != '1'
                                                      AND hcthCVD.TRANG_THAI != '4')
                                                  OR (
                                                          (hcthCVD.TRANG_THAI = '1'
                                                              OR hcthCVD.TRANG_THAI = '4')
                                                          AND hcthCVD.DON_VI_GUI = '29'
                                                      )
                                                  OR hcthCVD.TRANG_THAI IS NULL
                                              )
                                  )
                      )
                  AND (
                      status IS NULL OR hcthCVD.TRANG_THAI = status
                      )
                  AND (
                      loaiVanBan IS NULL OR hcthCVD.LOAI_VAN_BAN = loaiVanBan
                      )
                  AND (
                              timeType IS NULL
                          OR (
                                          fromTime IS NULL
                                      AND toTime IS NULL
                                  )
                          OR (
                                          timeType IS NOT NULL
                                      AND (
                                                      fromTime IS NULL
                                                  OR (
                                                              (
                                                                          timeType = 1
                                                                      AND hcthCVD.NGAY_GUI IS NOT NULL
                                                                      AND hcthCVD.NGAY_GUI >= fromTime
                                                                  )
                                                              OR (
                                                                          timeType = 2
                                                                      AND hcthCVD.NGAY_KY IS NOT NULL
                                                                      AND hcthCVD.NGAY_KY >= fromTime
                                                                  )
                                                          )
                                              )
                                      AND (
                                                      toTime IS NULL
                                                  OR (
                                                              (
                                                                          timeType = 1
                                                                      AND hcthCVD.NGAY_GUI IS NOT NULL
                                                                      AND hcthCVD.NGAY_GUI <= toTime
                                                                  )
                                                              OR (
                                                                          timeType = 2
                                                                      AND hcthCVD.NGAY_KY IS NOT NULL
                                                                      AND hcthCVD.NGAY_KY <= toTime
                                                                  )
                                                          )
                                              )
                                  )
                      )
                  AND (
                              ST = ''
                          OR LOWER(hcthCVD.TRICH_YEU) LIKE ST
                          OR LOWER(dvg.TEN) LIKE ST
                          OR LOWER(hcthCVD.SO_CONG_VAN) LIKE ST
                      )
              );

    OPEN CVD_INFO FOR
        SELECT *
        FROM (
                 SELECT hcthCVD.ID            AS                     "id",
                        hcthCVD.TRICH_YEU     AS                     "trichYeu",
                        hcthCVD.NGAY_GUI      AS                     "ngayGui",
                        hcthCVD.NGAY_KY       AS                     "ngayKy",
                        hcthCVD.CAN_BO_NHAN   AS                     "maCanBoNhan",
                        hcthCVD.TRANG_THAI    AS                     "trangThai",
                        hcthCVD.LOAI_CONG_VAN AS                     "loaiCongVan",
                        hcthCVD.SO_CONG_VAN   AS                     "soCongVan",
                        hcthCVD.LOAI_VAN_BAN  AS                     "loaiVanBan",
                        dvg.MA                AS                     "maDonViGui",
                        dvg.TEN               AS                     "tenDonViGui",
                        lvb.TEN               AS                     "tenLoaiVanBan",

                        (
                            SELECT LISTAGG(hcthDVN.DON_VI_NHAN, ',') WITHIN GROUP (
                                ORDER BY hcthDVN.ID
                                )
                            FROM HCTH_DON_VI_NHAN hcthDVN
                            WHERE hcthDVN.MA = hcthCVD.ID
                              AND hcthDVN.LOAI = 'DI'
                              AND hcthDVN.DON_VI_NHAN_NGOAI = 0
                        )                     AS                     "maDonViNhan",
                        (
                            SELECT LISTAGG(hcthDVN.DON_VI_NHAN, ',') WITHIN GROUP (
                                ORDER BY hcthDVN.ID
                                )
                            FROM HCTH_DON_VI_NHAN hcthDVN
                            WHERE hcthDVN.MA = hcthCVD.ID
                              AND hcthDVN.LOAI = 'DI'
                              AND hcthDVN.DON_VI_NHAN_NGOAI = 1
                        )                     AS                     "donViNhanNgoai",

                        (
                            SELECT LISTAGG(dvn.TEN, '; ') WITHIN GROUP (
                                ORDER BY dvn.TEN
                                )
                            FROM DM_DON_VI dvn
                                     LEFT JOIN HCTH_DON_VI_NHAN hcthDVN ON dvn.MA = hcthDVN.DON_VI_NHAN
                            WHERE hcthDVN.MA = hcthCVD.ID
                              AND hcthDVN.LOAI = 'DI'
                              AND hcthDVN.DON_VI_NHAN_NGOAI = 0
                        )                     AS                     "danhSachDonViNhan",

                        (
                            SELECT LISTAGG(dvgcv.TEN, '; ') WITHIN GROUP (
                                ORDER BY dvgcv.TEN
                                )
                            FROM DM_DON_VI_GUI_CV dvgcv
                                     LEFT JOIN HCTH_DON_VI_NHAN hcthDVN ON dvgcv.ID = hcthDVN.DON_VI_NHAN
                            WHERE hcthDVN.MA = hcthCVD.ID
                              AND hcthDVN.LOAI = 'DI'
                              AND hcthDVN.DON_VI_NHAN_NGOAI = 1
                        )                     AS                     "danhSachDonViNhanNgoai",

                        CASE
                            when hcthCVD.CAN_BO_NHAN is not null then
                                (
                                    SELECT LISTAGG(
                                                   CASE
                                                       WHEN cbn.HO IS NULL THEN cbn.TEN
                                                       WHEN cbn.TEN IS NULL THEN cbn.HO
                                                       WHEN DMCV.TEN IS NULL THEN CONCAT(CONCAT(cbn.HO, ' '), cbn.TEN)
                                                       ELSE CONCAT(CONCAT(CONCAT(DMCV.TEN, ' - '), CONCAT(cbn.HO, ' ')),
                                                                   cbn.TEN)
                                                       END,
                                                   '; '
                                               ) WITHIN GROUP (
                                                       order by cbn.TEN
                                                       ) as hoVaTenCanBo
                                    FROM TCHC_CAN_BO cbn
                                             LEFT JOIN QT_CHUC_VU qtcv ON cbn.SHCC = qtcv.SHCC AND CHUC_VU_CHINH = 1
                                             LEFT JOIN DM_CHUC_VU DMCV ON DMCV.MA = qtcv.MA_CHUC_VU
                                    WHERE cbn.SHCC in (SELECT regexp_substr(hcthCVD.CAN_BO_NHAN, '[^,]+', 1, level)
                                                       from dual
                                                       connect by regexp_substr(hcthCVD.CAN_BO_NHAN, '[^,]+', 1, level) is not null)
                                ) END         AS                     "danhSachCanBoNhan",

                        ROW_NUMBER() OVER (ORDER BY hcthCVD.ID DESC) R
                 FROM HCTH_CONG_VAN_DI hcthCVD
                          LEFT JOIN DM_DON_VI dvg on (hcthCVD.DON_VI_GUI = dvg.MA)
                          LEFT JOIN DM_LOAI_CONG_VAN lvb
                                    on hcthCVD.LOAI_VAN_BAN is not null and lvb.ID = hcthCVD.LOAI_VAN_BAN
                 WHERE (
                               ((
                                            donViGui IS NULL
                                        OR (
                                                        donViGui IS NOT NULL
                                                    AND donViGui = hcthCVD.DON_VI_GUI
                                                )
                                    )
                                   AND (
                                            maCanBo IS NULL
                                        OR (
                                                        maCanBo IS NOT NULL
                                                    AND maCanBo IN
                                                        (SELECT regexp_substr(hcthCVD.CAN_BO_NHAN, '[^,]+', 1, level)
                                                         from dual
                                                         connect by regexp_substr(hcthCVD.CAN_BO_NHAN, '[^,]+', 1, level) is NOT NULL
                                                        )
                                                )
                                    )
                                   AND (
                                            donVi IS NULL
                                        OR (
                                                        donVi IS NOT NULL
                                                    AND EXISTS(
                                                                SELECT hcthDVN.id
                                                                FROM HCTH_DON_VI_NHAN hcthDVN
                                                                WHERE hcthDVN.MA = hcthCVD.ID
                                                                  AND hcthDVN.LOAI = 'DI'
                                                                  AND hcthDVN.DON_VI_NHAN_NGOAI = 0
                                                                  AND hcthDVN.DON_VI_NHAN IN (
                                                                    select regexp_substr(donVi, '[^,]+', 1, level)
                                                                    from dual
                                                                    connect by regexp_substr(donVi, '[^,]+', 1, level) is not null
                                                                )
                                                            )
                                                )
                                    )
                                   AND (
                                            donViNhanNgoai IS NULL
                                        OR (
                                                        donViNhanNgoai IS NOT NULL
                                                    AND EXISTS(
                                                                SELECT hcthDVN.id
                                                                FROM HCTH_DON_VI_NHAN hcthDVN
                                                                WHERE hcthDVN.MA = hcthCVD.ID
                                                                  AND hcthDVN.LOAI = 'DI'
                                                                  AND hcthDVN.DON_VI_NHAN_NGOAI = 1
                                                                  AND hcthDVN.DON_VI_NHAN IN (
                                                                    select regexp_substr(donViNhanNgoai, '[^,]+', 1, level)
                                                                    from dual
                                                                    connect by regexp_substr(donViNhanNgoai, '[^,]+', 1, level) is not null
                                                                )
                                                            )
                                                )
                                    ))
                               AND (
                                           loaiCongVan IS NULL
                                       OR (
                                                   (
                                                               loaiCongVan = 1
                                                           AND hcthCVD.LOAI_CONG_VAN IS NOT NULL
                                                           AND hcthCVD.LOAI_CONG_VAN = 'DON_VI'
                                                       )
                                                   OR (
                                                               loaiCongVan = 2
                                                           AND hcthCVD.LOAI_CONG_VAN IS NOT NULL
                                                           AND hcthCVD.LOAI_CONG_VAN = 'TRUONG'
                                                       )
                                               )
                                   )
                               AND (
                                       (donViXem IS NULL AND canBoXem IS NULL)
                                       OR (donViXem IS NOT NULL AND hcthCVD.DON_VI_GUI IN
                                                                    (
                                                                        SELECT regexp_substr(donViXem, '[^,]+', 1, level)
                                                                        from dual
                                                                        connect by regexp_substr(donViXem, '[^,]+', 1, level) is NOT NULL
                                                                    )
                                           )
                                       OR (donViXem IS NOT NULL AND EXISTS(
                                           SELECT hcthDVN.ID
                                           FROM HCTH_DON_VI_NHAN hcthDVN
                                           WHERE hcthDVN.MA = hcthCVD.ID
                                             AND hcthDVN.LOAI = 'DI'
                                             AND hcthDVN.DON_VI_NHAN IN
                                                 (
                                                     select regexp_substr(donViXem, '[^,]+', 1, level)
                                                     from dual
                                                     connect by regexp_substr(donViXem, '[^,]+', 1, level) is not null
                                                 )
                                       )
                                       AND hcthCVD.TRANG_THAI != '1'
                                       AND hcthCVD.TRANG_THAI != '4'
                                           )
                                       OR
                                       (canBoXem IS NOT NULL AND canBoXem IN
                                                                 (
                                                                     SELECT regexp_substr(hcthCVD.CAN_BO_NHAN, '[^,]+', 1, level)
                                                                     from dual
                                                                     connect by regexp_substr(hcthCVD.CAN_BO_NHAN, '[^,]+', 1, level) is NOT NULL
                                                                 )
                                           AND hcthCVD.TRANG_THAI != '1'
                                           )
                                   )
                               AND (
                                           loaiCanBo = 0 -- staff
                                       OR (
                                                       loaiCanBo = 1 -- rector
                                                   AND (
                                                                   hcthCVD.TRANG_THAI != '1'
                                                               OR hcthCVD.TRANG_THAI IS NULL
                                                           )
                                               )
                                       OR (
                                                       loaiCanBo = 2 -- hcth
                                                   AND (
                                                               (hcthCVD.TRANG_THAI != '1'
                                                                   AND hcthCVD.TRANG_THAI != '4')
                                                               OR (
                                                                       (hcthCVD.TRANG_THAI = '1'
                                                                           OR hcthCVD.TRANG_THAI = '4')
                                                                       AND hcthCVD.DON_VI_GUI = '29'
                                                                   )
                                                               OR hcthCVD.TRANG_THAI IS NULL
                                                           )
                                               )
                                   )
                               AND (
                                   status IS NULL OR hcthCVD.TRANG_THAI = status
                                   )
                               AND (
                                   loaiVanBan IS NULL OR hcthCVD.LOAI_VAN_BAN = loaiVanBan
                                   )
                               AND (
                                           timeType IS NULL
                                       OR (
                                                       fromTime IS NULL
                                                   AND toTime IS NULL
                                               )
                                       OR (
                                                       timeType IS NOT NULL
                                                   AND (
                                                                   fromTime IS NULL
                                                               OR (
                                                                           (
                                                                                       timeType = 1
                                                                                   AND hcthCVD.NGAY_GUI IS NOT NULL
                                                                                   AND hcthCVD.NGAY_GUI >= fromTime
                                                                               )
                                                                           OR (
                                                                                       timeType = 2
                                                                                   AND hcthCVD.NGAY_KY IS NOT NULL
                                                                                   AND hcthCVD.NGAY_KY >= fromTime
                                                                               )
                                                                       )
                                                           )
                                                   AND (
                                                                   toTime IS NULL
                                                               OR (
                                                                           (
                                                                                       timeType = 1
                                                                                   AND hcthCVD.NGAY_GUI IS NOT NULL
                                                                                   AND hcthCVD.NGAY_GUI <= toTime
                                                                               )
                                                                           OR (
                                                                                       timeType = 2
                                                                                   AND hcthCVD.NGAY_KY IS NOT NULL
                                                                                   AND hcthCVD.NGAY_KY <= toTime
                                                                               )
                                                                       )
                                                           )
                                               )
                                   )
                               AND (
                                           ST = ''
                                       OR LOWER(hcthCVD.TRICH_YEU) LIKE ST
                                       OR LOWER(dvg.TEN) LIKE ST
                                       OR LOWER(hcthCVD.SO_CONG_VAN) LIKE ST
                                   )
                           )
                 ORDER BY hcthCVD.ID DESC
             );

    RETURN CVD_INFO;
END;

/
--EndMethod--

CREATE OR REPLACE FUNCTION HCTH_CONG_VAN_DI_GET_ALL_PHAN_HOI(
    idNhiemVu IN NUMBER
)   RETURN SYS_REFCURSOR AS
my_cursor SYS_REFCURSOR;
BEGIN

OPEN my_cursor FOR
SELECT
    ph.ID               as  "id",
    ph.NOI_DUNG         as  "noiDung",
    ph.CAN_BO_GUI       as  "canBoGui",
    ph.NGAY_TAO         as  "ngayTao",
    cb.HO               as  "ho",
    cb.TEN              as  "ten",
    CASE
        WHEN cb.HO IS NULL THEN cb.TEN
        WHEN cb.TEN IS NULL THEN cb.HO
    END as "hoTenDayDu"

FROM HCTH_PHAN_HOI ph
    LEFT JOIN TCHC_CAN_BO cb on ph.CAN_BO_GUI = cb.SHCC

WHERE (idNhiemVu is not null and ph.KEY = idNhiemVu)
ORDER BY NGAY_TAO;
RETURN my_cursor;
END;

/
--EndMethod--

CREATE OR REPLACE FUNCTION HCTH_CONG_VAN_DI_GET_ALL_STAFF(
    congVanId IN NUMBER
)   RETURN SYS_REFCURSOR
AS
    CVD_INFO SYS_REFCURSOR;
    canBoNhan STRING(200);
BEGIN
    SELECT hcth.CAN_BO_NHAN into canBoNhan FROM HCTH_CONG_VAN_DI hcth WHERE hcth.ID = congVanId;
    OPEN CVD_INFO FOR
        SELECT UNIQUE cb.email as "email"
        FROM TCHC_CAN_BO cb
            LEFT JOIN QT_CHUC_VU qtcv ON qtcv.SHCC = cb.SHCC AND qtcv.CHUC_VU_CHINH = 1
        WHERE cb.SHCC IN (
            SELECT regexp_substr(canBoNhan, '[^,]+', 1, level)
            FROM dual
            CONNECT BY regexp_substr(canBoNhan, '[^,]+', 1, level) IS NOT NULL
        ) OR (qtcv.MA_CHUC_VU IN ('003', '005', '007', '009', '011', '013') AND qtcv.MA_DON_VI IN (
            SELECT dvn.DON_VI_NHAN
            FROM HCTH_DON_VI_NHAN dvn
            WHERE dvn.LOAI = 'DI'
            AND dvn.MA = congVanId)
            );
    RETURN CVD_INFO;
END;

/
--EndMethod--

CREATE OR REPLACE FUNCTION HCTH_CONG_VAN_DI_GET_HCTH_STAFF
RETURN SYS_REFCURSOR
AS
    CVD_INFO SYS_REFCURSOR;
BEGIN
    OPEN CVD_INFO FOR
        SELECT cb.EMAIL AS "email"
        FROM TCHC_CAN_BO cb
            LEFT JOIN QT_CHUC_VU qtcv on qtcv.SHCC = cb.SHCC AND qtcv.CHUC_VU_CHINH = 1
        WHERE cb.SHCC IN (SELECT far.NGUOI_DUOC_GAN FROM FW_ASSIGN_ROLE far WHERE far.NHOM_ROLE = 'hcthQuanLyCongVanDi' )
            OR (qtcv.MA_CHUC_VU = '003' AND qtcv.MA_DON_VI = '29');
    RETURN CVD_INFO;
end;

/
--EndMethod--

CREATE OR REPLACE FUNCTION HCTH_CONG_VAN_DI_SEARCH_PAGE(
    pageNumber IN OUT NUMBER,
    pageSize IN OUT NUMBER,
    maCanBo IN STRING,
    donViGui IN NUMBER,
    donVi IN NUMBER,
    loaiCongVan IN NUMBER,
    loaiVanBan IN STRING,
    donViNhanNgoai IN NUMBER,
    donViXem IN STRING,
    canBoXem IN STRING,
    loaiCanBo IN NUMBER,
    status IN STRING,
    timeType IN NUMBER,
    fromTime IN NUMBER,
    toTime IN NUMBER,
    searchTerm IN STRING,
    totalItem OUT NUMBER,
    pageTotal OUT NUMBER)
    RETURN SYS_REFCURSOR
AS
    CVD_INFO SYS_REFCURSOR;
    ST       STRING(500) := '%' || lower(searchTerm) || '%';
BEGIN
    SELECT COUNT(*)
    INTO totalItem
    FROM HCTH_CONG_VAN_DI hcthCVD
             LEFT JOIN DM_DON_VI dvg on (hcthCVD.DON_VI_GUI = dvg.MA)
    WHERE (
                  ((
                               donViGui IS NULL
                           OR (
                                           donViGui IS NOT NULL
                                       AND donViGui = hcthCVD.DON_VI_GUI
                                   )
                       )
                      AND (
                               maCanBo IS NULL
                           OR (
                                           maCanBo IS NOT NULL
                                       AND maCanBo IN
                                           (SELECT regexp_substr(hcthCVD.CAN_BO_NHAN, '[^,]+', 1, level)
                                            from dual
                                            connect by regexp_substr(hcthCVD.CAN_BO_NHAN, '[^,]+', 1, level) is NOT NULL
                                           )
                                   )
                       )
                      AND (
                               donVi IS NULL
                           OR (
                                           donVi IS NOT NULL
                                       AND EXISTS(
                                                   SELECT hcthDVN.id
                                                   FROM HCTH_DON_VI_NHAN hcthDVN
                                                   WHERE hcthDVN.MA = hcthCVD.ID
                                                     AND hcthDVN.LOAI = 'DI'
                                                     AND hcthDVN.DON_VI_NHAN_NGOAI = 0
                                                     AND hcthDVN.DON_VI_NHAN IN (
                                                       select regexp_substr(donVi, '[^,]+', 1, level)
                                                       from dual
                                                       connect by regexp_substr(donVi, '[^,]+', 1, level) is not null
                                                   )
                                               )
                                   )
                       )
                      AND (
                               donViNhanNgoai IS NULL
                           OR (
                                           donViNhanNgoai IS NOT NULL
                                       AND EXISTS(
                                                   SELECT hcthDVN.id
                                                   FROM HCTH_DON_VI_NHAN hcthDVN
                                                   WHERE hcthDVN.MA = hcthCVD.ID
                                                     AND hcthDVN.LOAI = 'DI'
                                                     AND hcthDVN.DON_VI_NHAN_NGOAI = 1
                                                     AND hcthDVN.DON_VI_NHAN IN (
                                                       select regexp_substr(donViNhanNgoai, '[^,]+', 1, level)
                                                       from dual
                                                       connect by regexp_substr(donViNhanNgoai, '[^,]+', 1, level) is not null
                                                   )
                                               )
                                   )
                       ))
                  AND (
                              loaiCongVan IS NULL
                          OR (
                                      (
                                                  loaiCongVan = 1
                                              AND hcthCVD.LOAI_CONG_VAN IS NOT NULL
                                              AND hcthCVD.LOAI_CONG_VAN = 'DON_VI'
                                          )
                                      OR (
                                                  loaiCongVan = 2
                                              AND hcthCVD.LOAI_CONG_VAN IS NOT NULL
                                              AND hcthCVD.LOAI_CONG_VAN = 'TRUONG'
                                          )
                                  )
                      )
                  AND (
                          (donViXem IS NULL AND canBoXem IS NULL)
                          OR (donViXem IS NOT NULL AND hcthCVD.DON_VI_GUI IN
                                                       (
                                                           SELECT regexp_substr(donViXem, '[^,]+', 1, level)
                                                           from dual
                                                           connect by regexp_substr(donViXem, '[^,]+', 1, level) is NOT NULL
                                                       )
                              )
                          OR (donViXem IS NOT NULL AND EXISTS(
                              SELECT hcthDVN.ID
                              FROM HCTH_DON_VI_NHAN hcthDVN
                              WHERE hcthDVN.MA = hcthCVD.ID
                                AND hcthDVN.LOAI = 'DI'
                                AND hcthDVN.DON_VI_NHAN IN
                                    (
                                        select regexp_substr(donViXem, '[^,]+', 1, level)
                                        from dual
                                        connect by regexp_substr(donViXem, '[^,]+', 1, level) is not null
                                    )
                          )
                          AND hcthCVD.TRANG_THAI != '1'
                          AND hcthCVD.TRANG_THAI != '4'
                              )
                          OR
                          (canBoXem IS NOT NULL AND canBoXem IN
                                                    (
                                                        SELECT regexp_substr(hcthCVD.CAN_BO_NHAN, '[^,]+', 1, level)
                                                        from dual
                                                        connect by regexp_substr(hcthCVD.CAN_BO_NHAN, '[^,]+', 1, level) is NOT NULL
                                                    )
                              AND hcthCVD.TRANG_THAI != '1'
                              )
                      )
                  AND (
                              loaiCanBo = 0 -- staff
                          OR (
                                          loaiCanBo = 1 -- rector
                                      AND (
                                                      hcthCVD.TRANG_THAI != '1'
                                                  OR hcthCVD.TRANG_THAI IS NULL
                                              )
                                  )
                          OR (
                                          loaiCanBo = 2 -- hcth
                                      AND (
                                                  (hcthCVD.TRANG_THAI != '1'
                                                      AND hcthCVD.TRANG_THAI != '4')
                                                  OR (
                                                          (hcthCVD.TRANG_THAI = '1'
                                                              OR hcthCVD.TRANG_THAI = '4')
                                                          AND hcthCVD.DON_VI_GUI = '29'
                                                      )
                                                  OR hcthCVD.TRANG_THAI IS NULL
                                              )
                                  )
                      )
                  AND (
                      status IS NULL OR hcthCVD.TRANG_THAI = status
                      )
                  AND (
                      loaiVanBan IS NULL OR hcthCVD.LOAI_VAN_BAN = loaiVanBan
                      )
                  AND (
                              timeType IS NULL
                          OR (
                                          fromTime IS NULL
                                      AND toTime IS NULL
                                  )
                          OR (
                                          timeType IS NOT NULL
                                      AND (
                                                      fromTime IS NULL
                                                  OR (
                                                              (
                                                                          timeType = 1
                                                                      AND hcthCVD.NGAY_GUI IS NOT NULL
                                                                      AND hcthCVD.NGAY_GUI >= fromTime
                                                                  )
                                                              OR (
                                                                          timeType = 2
                                                                      AND hcthCVD.NGAY_KY IS NOT NULL
                                                                      AND hcthCVD.NGAY_KY >= fromTime
                                                                  )
                                                          )
                                              )
                                      AND (
                                                      toTime IS NULL
                                                  OR (
                                                              (
                                                                          timeType = 1
                                                                      AND hcthCVD.NGAY_GUI IS NOT NULL
                                                                      AND hcthCVD.NGAY_GUI <= toTime
                                                                  )
                                                              OR (
                                                                          timeType = 2
                                                                      AND hcthCVD.NGAY_KY IS NOT NULL
                                                                      AND hcthCVD.NGAY_KY <= toTime
                                                                  )
                                                          )
                                              )
                                  )
                      )
                  AND (
                              ST = ''
                          OR LOWER(hcthCVD.TRICH_YEU) LIKE ST
                          OR LOWER(dvg.TEN) LIKE ST
                          OR LOWER(hcthCVD.SO_CONG_VAN) LIKE ST
                      )
              );

    IF pageNumber < 1 THEN pageNumber := 1; END IF;
    IF pageSize < 1 THEN pageSize := 1; END IF;
    pageTotal := CEIL(totalItem / pageSize);
    pageNumber := LEAST(pageNumber, pageTotal);

    OPEN CVD_INFO FOR
        SELECT *
        FROM (
                 SELECT hcthCVD.ID            AS                     "id",
                        hcthCVD.TRICH_YEU     AS                     "trichYeu",
                        hcthCVD.NGAY_GUI      AS                     "ngayGui",
                        hcthCVD.NGAY_KY       AS                     "ngayKy",
                        hcthCVD.CAN_BO_NHAN   AS                     "maCanBoNhan",
                        hcthCVD.TRANG_THAI    AS                     "trangThai",
                        hcthCVD.LOAI_CONG_VAN AS                     "loaiCongVan",
                        hcthCVD.SO_CONG_VAN   AS                     "soCongVan",
                        hcthCVD.LOAI_VAN_BAN  AS                     "loaiVanBan",
                        dvg.MA                AS                     "maDonViGui",
                        dvg.TEN               AS                     "tenDonViGui",
                        lvb.TEN               AS                     "tenLoaiVanBan",

                        (
                            SELECT LISTAGG(hcthDVN.DON_VI_NHAN, ',') WITHIN GROUP (
                                ORDER BY hcthDVN.ID
                                )
                            FROM HCTH_DON_VI_NHAN hcthDVN
                            WHERE hcthDVN.MA = hcthCVD.ID
                              AND hcthDVN.LOAI = 'DI'
                              AND hcthDVN.DON_VI_NHAN_NGOAI = 0
                        )                     AS                     "maDonViNhan",
                        (
                            SELECT LISTAGG(hcthDVN.DON_VI_NHAN, ',') WITHIN GROUP (
                                ORDER BY hcthDVN.ID
                                )
                            FROM HCTH_DON_VI_NHAN hcthDVN
                            WHERE hcthDVN.MA = hcthCVD.ID
                              AND hcthDVN.LOAI = 'DI'
                              AND hcthDVN.DON_VI_NHAN_NGOAI = 1
                        )                     AS                     "donViNhanNgoai",

                        (
                            SELECT LISTAGG(dvn.TEN, '; ') WITHIN GROUP (
                                ORDER BY dvn.TEN
                                )
                            FROM DM_DON_VI dvn
                                     LEFT JOIN HCTH_DON_VI_NHAN hcthDVN ON dvn.MA = hcthDVN.DON_VI_NHAN
                            WHERE hcthDVN.MA = hcthCVD.ID
                              AND hcthDVN.LOAI = 'DI'
                              AND hcthDVN.DON_VI_NHAN_NGOAI = 0
                        )                     AS                     "danhSachDonViNhan",

                        (
                            SELECT LISTAGG(dvgcv.TEN, '; ') WITHIN GROUP (
                                ORDER BY dvgcv.TEN
                                )
                            FROM DM_DON_VI_GUI_CV dvgcv
                                     LEFT JOIN HCTH_DON_VI_NHAN hcthDVN ON dvgcv.ID = hcthDVN.DON_VI_NHAN
                            WHERE hcthDVN.MA = hcthCVD.ID
                              AND hcthDVN.LOAI = 'DI'
                              AND hcthDVN.DON_VI_NHAN_NGOAI = 1
                        )                     AS                     "danhSachDonViNhanNgoai",

                        CASE
                            when hcthCVD.CAN_BO_NHAN is not null then
                                (
                                    SELECT LISTAGG(
                                                   CASE
                                                       WHEN cbn.HO IS NULL THEN cbn.TEN
                                                       WHEN cbn.TEN IS NULL THEN cbn.HO
                                                       WHEN DMCV.TEN IS NULL THEN CONCAT(CONCAT(cbn.HO, ' '), cbn.TEN)
                                                       ELSE CONCAT(CONCAT(CONCAT(DMCV.TEN, ' - '), CONCAT(cbn.HO, ' ')),
                                                                   cbn.TEN)
                                                       END,
                                                   '; '
                                               ) WITHIN GROUP (
                                                       order by cbn.TEN
                                                       ) as hoVaTenCanBo
                                    FROM TCHC_CAN_BO cbn
                                             LEFT JOIN QT_CHUC_VU qtcv ON cbn.SHCC = qtcv.SHCC AND CHUC_VU_CHINH = 1
                                             LEFT JOIN DM_CHUC_VU DMCV ON DMCV.MA = qtcv.MA_CHUC_VU
                                    WHERE cbn.SHCC in (SELECT regexp_substr(hcthCVD.CAN_BO_NHAN, '[^,]+', 1, level)
                                                       from dual
                                                       connect by regexp_substr(hcthCVD.CAN_BO_NHAN, '[^,]+', 1, level) is not null)
                                ) END         AS                     "danhSachCanBoNhan",

                        ROW_NUMBER() OVER (ORDER BY hcthCVD.ID DESC) R
                 FROM HCTH_CONG_VAN_DI hcthCVD
                          LEFT JOIN DM_DON_VI dvg on (hcthCVD.DON_VI_GUI = dvg.MA)
                          LEFT JOIN DM_LOAI_CONG_VAN lvb
                                    on hcthCVD.LOAI_VAN_BAN is not null and lvb.ID = hcthCVD.LOAI_VAN_BAN
                 WHERE (
                               ((
                                            donViGui IS NULL
                                        OR (
                                                        donViGui IS NOT NULL
                                                    AND donViGui = hcthCVD.DON_VI_GUI
                                                )
                                    )
                                   AND (
                                            maCanBo IS NULL
                                        OR (
                                                        maCanBo IS NOT NULL
                                                    AND maCanBo IN
                                                        (SELECT regexp_substr(hcthCVD.CAN_BO_NHAN, '[^,]+', 1, level)
                                                         from dual
                                                         connect by regexp_substr(hcthCVD.CAN_BO_NHAN, '[^,]+', 1, level) is NOT NULL
                                                        )
                                                )
                                    )
                                   AND (
                                            donVi IS NULL
                                        OR (
                                                        donVi IS NOT NULL
                                                    AND EXISTS(
                                                                SELECT hcthDVN.id
                                                                FROM HCTH_DON_VI_NHAN hcthDVN
                                                                WHERE hcthDVN.MA = hcthCVD.ID
                                                                  AND hcthDVN.LOAI = 'DI'
                                                                  AND hcthDVN.DON_VI_NHAN_NGOAI = 0
                                                                  AND hcthDVN.DON_VI_NHAN IN (
                                                                    select regexp_substr(donVi, '[^,]+', 1, level)
                                                                    from dual
                                                                    connect by regexp_substr(donVi, '[^,]+', 1, level) is not null
                                                                )
                                                            )
                                                )
                                    )
                                   AND (
                                            donViNhanNgoai IS NULL
                                        OR (
                                                        donViNhanNgoai IS NOT NULL
                                                    AND EXISTS(
                                                                SELECT hcthDVN.id
                                                                FROM HCTH_DON_VI_NHAN hcthDVN
                                                                WHERE hcthDVN.MA = hcthCVD.ID
                                                                  AND hcthDVN.LOAI = 'DI'
                                                                  AND hcthDVN.DON_VI_NHAN_NGOAI = 1
                                                                  AND hcthDVN.DON_VI_NHAN IN (
                                                                    select regexp_substr(donViNhanNgoai, '[^,]+', 1, level)
                                                                    from dual
                                                                    connect by regexp_substr(donViNhanNgoai, '[^,]+', 1, level) is not null
                                                                )
                                                            )
                                                )
                                    ))
                               AND (
                                           loaiCongVan IS NULL
                                       OR (
                                                   (
                                                               loaiCongVan = 1
                                                           AND hcthCVD.LOAI_CONG_VAN IS NOT NULL
                                                           AND hcthCVD.LOAI_CONG_VAN = 'DON_VI'
                                                       )
                                                   OR (
                                                               loaiCongVan = 2
                                                           AND hcthCVD.LOAI_CONG_VAN IS NOT NULL
                                                           AND hcthCVD.LOAI_CONG_VAN = 'TRUONG'
                                                       )
                                               )
                                   )
                               AND (
                                       (donViXem IS NULL AND canBoXem IS NULL)
                                       OR (donViXem IS NOT NULL AND hcthCVD.DON_VI_GUI IN
                                                                    (
                                                                        SELECT regexp_substr(donViXem, '[^,]+', 1, level)
                                                                        from dual
                                                                        connect by regexp_substr(donViXem, '[^,]+', 1, level) is NOT NULL
                                                                    )
                                           )
                                       OR (donViXem IS NOT NULL AND EXISTS(
                                           SELECT hcthDVN.ID
                                           FROM HCTH_DON_VI_NHAN hcthDVN
                                           WHERE hcthDVN.MA = hcthCVD.ID
                                             AND hcthDVN.LOAI = 'DI'
                                             AND hcthDVN.DON_VI_NHAN IN
                                                 (
                                                     select regexp_substr(donViXem, '[^,]+', 1, level)
                                                     from dual
                                                     connect by regexp_substr(donViXem, '[^,]+', 1, level) is not null
                                                 )
                                       )
                                       AND hcthCVD.TRANG_THAI != '1'
                                       AND hcthCVD.TRANG_THAI != '4'
                                           )
                                       OR
                                       (canBoXem IS NOT NULL AND canBoXem IN
                                                                 (
                                                                     SELECT regexp_substr(hcthCVD.CAN_BO_NHAN, '[^,]+', 1, level)
                                                                     from dual
                                                                     connect by regexp_substr(hcthCVD.CAN_BO_NHAN, '[^,]+', 1, level) is NOT NULL
                                                                 )
                                           AND hcthCVD.TRANG_THAI != '1'
                                           )
                                   )
                               AND (
                                           loaiCanBo = 0 -- staff
                                       OR (
                                                       loaiCanBo = 1 -- rector
                                                   AND (
                                                                   hcthCVD.TRANG_THAI != '1'
                                                               OR hcthCVD.TRANG_THAI IS NULL
                                                           )
                                               )
                                       OR (
                                                       loaiCanBo = 2 -- hcth
                                                   AND (
                                                               (hcthCVD.TRANG_THAI != '1'
                                                                   AND hcthCVD.TRANG_THAI != '4')
                                                               OR (
                                                                       (hcthCVD.TRANG_THAI = '1'
                                                                           OR hcthCVD.TRANG_THAI = '4')
                                                                       AND hcthCVD.DON_VI_GUI = '29'
                                                                   )
                                                               OR hcthCVD.TRANG_THAI IS NULL
                                                           )
                                               )
                                   )
                               AND (
                                   status IS NULL OR hcthCVD.TRANG_THAI = status
                                   )
                               AND (
                                   loaiVanBan IS NULL OR hcthCVD.LOAI_VAN_BAN = loaiVanBan
                                   )
                               AND (
                                           timeType IS NULL
                                       OR (
                                                       fromTime IS NULL
                                                   AND toTime IS NULL
                                               )
                                       OR (
                                                       timeType IS NOT NULL
                                                   AND (
                                                                   fromTime IS NULL
                                                               OR (
                                                                           (
                                                                                       timeType = 1
                                                                                   AND hcthCVD.NGAY_GUI IS NOT NULL
                                                                                   AND hcthCVD.NGAY_GUI >= fromTime
                                                                               )
                                                                           OR (
                                                                                       timeType = 2
                                                                                   AND hcthCVD.NGAY_KY IS NOT NULL
                                                                                   AND hcthCVD.NGAY_KY >= fromTime
                                                                               )
                                                                       )
                                                           )
                                                   AND (
                                                                   toTime IS NULL
                                                               OR (
                                                                           (
                                                                                       timeType = 1
                                                                                   AND hcthCVD.NGAY_GUI IS NOT NULL
                                                                                   AND hcthCVD.NGAY_GUI <= toTime
                                                                               )
                                                                           OR (
                                                                                       timeType = 2
                                                                                   AND hcthCVD.NGAY_KY IS NOT NULL
                                                                                   AND hcthCVD.NGAY_KY <= toTime
                                                                               )
                                                                       )
                                                           )
                                               )
                                   )
                               AND (
                                           ST = ''
                                       OR LOWER(hcthCVD.TRICH_YEU) LIKE ST
                                       OR LOWER(dvg.TEN) LIKE ST
                                       OR LOWER(hcthCVD.SO_CONG_VAN) LIKE ST
                                   )
                           )
                 ORDER BY hcthCVD.ID DESC
             )
        WHERE R BETWEEN (pageNumber - 1) * pageSize + 1 AND pageNumber * pageSize;
    RETURN CVD_INFO;
END;

/
--EndMethod--

CREATE OR REPLACE function HCTH_CONG_VAN_DI_SEARCH_SELECTOR(
    pageNumber IN OUT NUMBER,
    pageSize IN OUT NUMBER,
    filterParam in STRING,
    searchTerm IN STRING,
    totalItem OUT NUMBER,
    pageTotal OUT NUMBER
) RETURN SYS_REFCURSOR AS
    my_cursor  SYS_REFCURSOR;
    sT         STRING(500) := '%' || lower(searchTerm) || '%';
    donViCanBo STRING(24);
    shccCanBo  STRING(24);
    fromTime   NUMBER(20);
    toTime     NUMBER(20);
    staffType  NUMBER(4);
    ids        STRING(64);
    hasIds     NUMBER(1);
    excludeIds STRING(64);

BEGIN

    SELECT JSON_VALUE(filterParam, '$.donViCanBo') INTO donViCanBo FROM DUAL;
    SELECT JSON_VALUE(filterParam, '$.shccCanBo') INTO shccCanBo FROM DUAL;
    SELECT JSON_VALUE(filterParam, '$.fromTime') INTO fromTime FROM DUAL;
    SELECT JSON_VALUE(filterParam, '$.toTime') INTO toTime FROM DUAL;
    SELECT JSON_VALUE(filterParam, '$.staffType') INTO staffType FROM DUAL;
    SELECT JSON_VALUE(filterParam, '$.ids') INTO ids FROM DUAL;
    SELECT JSON_VALUE(filterParam, '$.excludeIds') INTO excludeIds FROM DUAL;
    SELECT JSON_VALUE(filterParam, '$.hasIds') INTO hasIds FROM DUAL;


    SELECT COUNT(*)
    INTO totalItem
    FROM HCTH_CONG_VAN_DI hcthcvd
    WHERE
      -- permisssion check
        (
                (staffType = 1 AND (hcthcvd.TRANG_THAI != '1' OR hcthcvd.TRANG_THAI IS NULL)) OR
                (staffType = 2 AND (
                        (hcthcvd.TRANG_THAI != '1' AND hcthcvd.TRANG_THAI != '4')
                        OR ((hcthcvd.TRANG_THAI = '1' OR hcthcvd.TRANG_THAI = '4') AND hcthcvd.DON_VI_GUI = '29')
                        OR hcthcvd.TRANG_THAI IS NULL
                    )) OR
                (staffType = 0 AND (donViCanBo IS NOT NULL AND EXISTS(
                        SELECT hcthDVN.ID
                        FROM HCTH_DON_VI_NHAN hcthDVN
                        WHERE hcthDVN.MA = hcthcvd.ID
                          AND hcthDVN.LOAI = 'DI'
                          AND hcthDVN.DON_VI_NHAN IN
                              (
                                  select regexp_substr(donViCanBo, '[^,]+', 1, level)
                                  from dual
                                  connect by regexp_substr(donViCanBo, '[^,]+', 1, level) is not null
                              )
                    )
                    AND hcthcvd.TRANG_THAI != '1'
                    AND hcthcvd.TRANG_THAI != '4'
                    )
                    OR (donViCanBo IS NOT NULL AND hcthcvd.DON_VI_GUI IN
                                                   (
                                                       SELECT regexp_substr(donViCanBo, '[^,]+', 1, level)
                                                       from dual
                                                       connect by regexp_substr(donViCanBo, '[^,]+', 1, level) is NOT NULL
                                                   )
                     )
                    OR (
                             shccCanBo IS NOT NULL AND shccCanBo IN
                                                       (
                                                           SELECT regexp_substr(hcthcvd.CAN_BO_NHAN, '[^,]+', 1, level)
                                                           from dual
                                                           connect by regexp_substr(hcthcvd.CAN_BO_NHAN, '[^,]+', 1, level) is NOT NULL
                                                       )
                         AND hcthcvd.TRANG_THAI != '1'
                     )
                    )
            ) --filter
      and (fromTime is null or (hcthcvd.NGAY_GUI is not null and hcthcvd.NGAY_GUI > fromTime))
      AND (toTime is null or (hcthcvd.NGAY_GUI is not null and hcthcvd.NGAY_GUI < toTime))
      AND (
                sT is null
            OR LOWER(hcthcvd.TRICH_YEU) LIKE sT
        )
      AND (hasIds = 0 or hcthcvd.id in (select regexp_substr(ids, '[^,]+', 1, level)
                                        from dual
                                        connect by regexp_substr(ids, '[^,]+', 1, level) is not null))
      AND (excludeIds is NUll or hcthcvd.id not in (select regexp_substr(excludeIds, '[^,]+', 1, level)
                                                    from dual
                                                    connect by regexp_substr(excludeIds, '[^,]+', 1, level) is not null));
    IF pageNumber < 1 THEN
        pageNumber := 1;
    END IF;
    IF pageSize < 1 THEN
        pageSize := 1;
    END IF;
    pageTotal := CEIL(totalItem / pageSize);
    pageNumber := LEAST(pageNumber, pageTotal);

    OPEN my_cursor FOR
--         select ID as "id" from HCTH_CONG_VAN_DI;
        SELECT *
        FROM (SELECT hcthcvd.ID            AS                     "id",
                     hcthcvd.SO_DI         AS                     "soDi",
                     hcthcvd.LOAI_CONG_VAN AS                     "loai",
                     hcthcvd.DON_VI_GUI    AS                     "maDonViGui",
                     dvg.TEN               AS                     "tenDonViGui",
                     hcthcvd.TRICH_YEU     AS                     "trichYeu",
                     hcthcvd.TRANG_THAI    AS                     "trangThai",

                     ROW_NUMBER() OVER (ORDER BY hcthcvd.ID DESC) R
              FROM HCTH_CONG_VAN_DI hcthcvd
                       LEFT JOIN DM_DON_VI dvg on hcthcvd.DON_VI_GUI = dvg.MA
              WHERE
                -- permisssion check
                  (
                          (staffType = 1 AND (hcthcvd.TRANG_THAI != '1' OR hcthcvd.TRANG_THAI IS NULL)) OR
                          (staffType = 2 AND (
                                  (hcthcvd.TRANG_THAI != '1' AND hcthcvd.TRANG_THAI != '4')
                                  OR
                                  ((hcthcvd.TRANG_THAI = '1' OR hcthcvd.TRANG_THAI = '4') AND hcthcvd.DON_VI_GUI = '29')
                                  OR hcthcvd.TRANG_THAI IS NULL
                              )) OR
                          (staffType = 0 AND (donViCanBo IS NOT NULL AND EXISTS(
                                  SELECT hcthDVN.ID
                                  FROM HCTH_DON_VI_NHAN hcthDVN
                                  WHERE hcthDVN.MA = hcthcvd.ID
                                    AND hcthDVN.LOAI = 'DI'
                                    AND hcthDVN.DON_VI_NHAN IN
                                        (
                                            select regexp_substr(donViCanBo, '[^,]+', 1, level)
                                            from dual
                                            connect by regexp_substr(donViCanBo, '[^,]+', 1, level) is not null
                                        )
                              )
                              AND hcthcvd.TRANG_THAI != '1'
                              AND hcthcvd.TRANG_THAI != '4'
                              )
                              OR (donViCanBo IS NOT NULL AND hcthcvd.DON_VI_GUI IN
                                                             (
                                                                 SELECT regexp_substr(donViCanBo, '[^,]+', 1, level)
                                                                 from dual
                                                                 connect by regexp_substr(donViCanBo, '[^,]+', 1, level) is NOT NULL
                                                             )
                               )
                              OR (
                                       shccCanBo IS NOT NULL AND shccCanBo IN
                                                                 (
                                                                     SELECT regexp_substr(hcthcvd.CAN_BO_NHAN, '[^,]+', 1, level)
                                                                     from dual
                                                                     connect by regexp_substr(hcthcvd.CAN_BO_NHAN, '[^,]+', 1, level) is NOT NULL
                                                                 )
                                   AND hcthcvd.TRANG_THAI != '1'
                               )
                              )
                      ) --filter
                and (fromTime is null or (hcthcvd.NGAY_GUI is not null and hcthcvd.NGAY_GUI > fromTime))
                AND (toTime is null or (hcthcvd.NGAY_GUI is not null and hcthcvd.NGAY_GUI < toTime))
                AND (
                          sT is null
                      OR LOWER(hcthcvd.TRICH_YEU) LIKE sT
                  )
                AND (hasIds = 0 or hcthcvd.id in (select regexp_substr(ids, '[^,]+', 1, level)
                                                  from dual
                                                  connect by regexp_substr(ids, '[^,]+', 1, level) is not null))
                AND (excludeIds is NUll or hcthcvd.id not in (select regexp_substr(excludeIds, '[^,]+', 1, level)
                                                              from dual
                                                              connect by regexp_substr(excludeIds, '[^,]+', 1, level) is not null)))
        WHERE R BETWEEN (pageNumber - 1) * pageSize + 1 AND pageNumber * pageSize
        ORDER BY R;
    RETURN my_cursor;
END ;

/
--EndMethod--

CREATE OR REPLACE procedure hcth_cong_van_di_update_so_cong_van(
    ma in number,
    donViGui in NUMBER,
    nam in NUMBER
)
IS
    maxThuTu number;
    tenVietTatDonViGui STRING(100);
    loaiVanBan STRING(10);
    loaiCongVan STRING(10);
    soCongVan STRING(200);
BEGIN
    commit;
    set transaction isolation level SERIALIZABLE name 'update_so_cong_van_di';
    begin
        SELECT hcthCVD.LOAI_CONG_VAN into loaiCongVan from HCTH_CONG_VAN_DI hcthCVD WHERE hcthCVD.ID = ma;

        select MAX(SO_DI) into maxThuTu from HCTH_CONG_VAN_DI WHERE donViGui = DON_VI_GUI and (NGAY_TAO > nam) AND LOAI_CONG_VAN = loaiCongVan;

        SELECT dvg.TEN_VIET_TAT into tenVietTatDonViGui
        FROM DM_DON_VI dvg
        WHERE dvg.MA = donViGui;

        SELECT lcv.TEN_VIET_TAT into loaiVanBan
        FROM  HCTH_CONG_VAN_DI hcthCVD LEFT JOIN  DM_LOAI_CONG_VAN lcv ON lcv.ID = hcthCVD.LOAI_VAN_BAN
        WHERE hcthCVD.ID = ma;
    exception
        when NO_DATA_FOUND then
        maxThuTu := 0;
    end;

    if maxThuTu is null then
        maxThuTu := 0;
    end if;
    maxThuTu := maxThuTu+1;

--     IF tenVietTatDonViGui IS NULL AND loaiVanBan IS NULL THEN
--         soCongVan := TO_CHAR(maxThuTu) || '/XHNV';
--     ELSIF tenVietTatDonViGui IS NULL AND loaiVanBan IS NOT NULL THEN
--         soCongVan := TO_CHAR(maxThuTu) || '/' + loaiVanBan || '-XHNV';
--     ELSIF tenVietTatDonViGui IS NOT NULL AND loaiVanBan IS NULL THEN
--         soCongVan := TO_CHAR(maxThuTu) || '/XHNV-' || tenVietTatDonViGui;
--     ELSE
--         soCongVan := TO_CHAR(maxThuTu) || '/' || loaiVanBan || '-XHNV-' || tenVietTatDonViGui;
--     end if;

    soCongVan := TO_CHAR(maxThuTu) || '/';
    IF loaiVanBan IS NOT NULL THEN
        soCongVan := soCongVan || loaiVanBan || '-';
    end if;

    soCongVan := soCongVan || 'XHNV';
    IF tenVietTatDonViGui IS NOT NULL THEN
        soCongVan := soCongVan || '-' || tenVietTatDonViGui;
    end if;

    update HCTH_CONG_VAN_DI hcthCVD set
    hcthCVD.SO_DI = maxThuTu,
    hcthCVD.TEN_VIET_TAT_DON_VI_GUI = tenVietTatDonViGui,
    hcthCVD.SO_CONG_VAN = soCongVan
    WHERE hcthCVD.ID = ma;
    commit;
END;

/
--EndMethod--

CREATE OR REPLACE FUNCTION HCTH_CONG_VAN_TRINH_KY_GET_FROM(
    fileId in number) RETURN SYS_REFCURSOR AS
    my_cursor SYS_REFCURSOR;
BEGIN
    OPEN my_cursor FOR
        SELECT hcthcvtk.ID         as "id",
               hcthcvtk.NGUOI_TAO  as "shccNguoiTao",
               hcthcvtk.THOI_GIAN  as "thoiGian",
                (SELECT LISTAGG(
                    CASE
                        WHEN cbk.HO IS NULL THEN cbk.TEN
                        WHEN cbk.TEN IS NULL THEN cbk.HO
                        ELSE CONCAT(CONCAT(cbk.HO, ' '), cbk.TEN)
                    END, ',') WITHIN GROUP (
                             order by hcthcbk.ID
                             )
                      FROM HCTH_CAN_BO_KY hcthcbk
                            LEFT JOIN TCHC_CAN_BO cbk ON cbk.SHCC = hcthcbk.NGUOI_KY
                      WHERE hcthcbk.CONG_VAN_TRINH_KY = hcthcvtk.ID
                    )
                     AS "danhSachTenCanBoKy",
                (SELECT LISTAGG(hcthcbk.NGUOI_KY, ',') WITHIN GROUP (
                             order by hcthcbk.ID
                             )
                      FROM HCTH_CAN_BO_KY hcthcbk
                      WHERE hcthcbk.CONG_VAN_TRINH_KY = hcthcvtk.ID
                    )
                     AS "danhSachShccCanBoKy"
--                  LISTAGG(last_name, '; ') WITHIN GROUP (ORDER BY hire_date, last_name)
--
        from HCTH_CONG_VAN_TRINH_KY hcthcvtk
--                 LEFT JOIN TCHC_CAN_BO cbk on hcthcbk.NGUOI_KY = cbk.SHCC
        where (hcthcvtk.FILE_CONG_VAN = fileId)
        order by hcthcvtk.id;
    RETURN my_cursor;
END;

/
--EndMethod--

CREATE OR REPLACE FUNCTION HCTH_CONG_VAN_TRINH_KY_SEARCH_PAGE(
    pageNumber IN OUT NUMBER,
    pageSize IN OUT NUMBER,
    shccCanBo IN STRING,
    filterParam in STRING,
    searchTerm IN STRING,
    totalItem OUT NUMBER,
    pageTotal OUT NUMBER
) RETURN SYS_REFCURSOR AS
    my_cursor SYS_REFCURSOR;
    sT        STRING(500) := '%' || lower(searchTerm) || '%';

BEGIN

    SELECT COUNT(*)
    INTO totalItem
    FROM HCTH_CONG_VAN_TRINH_KY cvtk
-- LEFT JOIN HCTH_CAN_BO_NHAN hcthcbn ON hcthcbn.KEY = nv.ID AND hcthcbn.LOAI = 'NHIEM_VU'
    where (cvtk.NGUOI_TAO = shccCanBo);
    IF pageNumber < 1 THEN
        pageNumber := 1;
    END IF;
    IF pageSize < 1 THEN
        pageSize := 1;
    END IF;
    pageTotal := CEIL(totalItem / pageSize);
    pageNumber := LEAST(pageNumber, pageTotal);

    OPEN my_cursor FOR
        SELECT *
        FROM (SELECT cvtk.ID           as "id",
                     cvtk.FILE_CONG_VAN     as "congVanId",
                     cvtk.NGUOI_TAO    as "nguoiTao",
                     cvtk.THOI_GIAN    as "thoiGian",
                     cbt.HO            as "hoNguoiTao",
                     cbt.TEN           as "tenNguoiTao",
                     hcthcvd.TRICH_YEU  as "trichYeu",
                     hcthcvd.LOAI_CONG_VAN as "loaiCongVan",
                     (SELECT LISTAGG(
                                     CASE
                                         WHEN cb.HO IS NULL THEN cb.TEN
                                         WHEN cb.TEN IS NULL THEN cb.HO
                                         ELSE CONCAT(CONCAT(cb.HO, ' '), cb.TEN)
                                         END,
                                     ';'
                                 ) WITHIN GROUP (
                                         order by cb.TEN
                                         ) as "hoVaTenCanBo"
                      FROM HCTH_CAN_BO_KY cbk
                               LEFT JOIN TCHC_CAN_BO cb on cbk.NGUOI_KY = cb.SHCC
                      where cbk.CONG_VAN_TRINH_KY = cvtk.id
                     )                 as "danhSachCanBoKy",

                     ROW_NUMBER() OVER (
                         ORDER BY cvtk.ID DESC
                         )                R
              FROM HCTH_CONG_VAN_TRINH_KY cvtk
                       LEFT JOIN TCHC_CAN_BO cbt on cbt.SHCC = cvtk.NGUOI_TAO
                       LEFT JOIN HCTH_FILE hcthfile on hcthfile.LOAI='DI' and hcthfile.ID = cvtk.FILE_CONG_VAN
                        LEFT JOIN HCTH_CONG_VAN_DI hcthcvd on hcthcvd.ID = hcthfile.MA
              WHERE
-- check if user is related to congVanTrinhKy
(
    cvtk.NGUOI_TAO = shccCanBo
    ))
        WHERE R BETWEEN (pageNumber - 1) * pageSize + 1 AND pageNumber * pageSize
        ORDER BY 'id' DESC;
    RETURN my_cursor;
END;

/
--EndMethod--

CREATE OR REPLACE FUNCTION HCTH_GIAO_NHIEM_VU_GET_ALL_CAN_BO_NHAN(
    nhiemVuId IN NUMBER
)   RETURN SYS_REFCURSOR AS
my_cursor SYS_REFCURSOR;
BEGIN

OPEN my_cursor FOR
SELECT
    hcthcbn.ID               as  "id",
    hcthcbn.CAN_BO_NHAN      as  "canBoNhan",
    hcthcbn.NGUOI_TAO        as  "nguoiTao",

CASE when hcthcbn.CAN_BO_NHAN is not null then
(
                SELECT LISTAGG(
                        CASE
                            WHEN cb.HO IS NULL THEN cb.TEN
                            WHEN cb.TEN IS NULL THEN cb.HO
                            ELSE CONCAT(CONCAT(cb.HO, ' '), cb.TEN)
                        END,
                        '; '
                    ) WITHIN GROUP (
                        order by cb.TEN
                    )
                FROM TCHC_CAN_BO cb
                WHERE INSTR(CONCAT(hcthcbn.CAN_BO_NHAN,','), CONCAT(cb.shcc, ',')) != 0
) END AS "danhSachCanBoNhan",
CASE when hcthcbn.NGUOI_TAO is not null then
(
    SELECT (
        CASE
            WHEN cb.HO IS NULL THEN cb.TEN
            WHEN cb.TEN IS NULL THEN cb.HO
            ELSE CONCAT(CONCAT(cb.HO, ' '), cb.TEN)
        END
    )
    FROM TCHC_CAN_BO cb
    WHERE hcthcbn.NGUOI_TAO = cb.SHCC
) END AS "tenNguoiTao"
FROM HCTH_CAN_BO_NHAN hcthcbn
WHERE (nhiemVuId is not null and hcthcbn.MA=nhiemVuId and hcthcbn.LOAI = 'NHIEM_VU')
ORDER BY hcthcbn.ID;
RETURN my_cursor;
END;

/
--EndMethod--

CREATE OR REPLACE FUNCTION HCTH_HISTORY_GET_ALL_FROM(
    target IN NUMBER,
    targetType in STRING,
    sortType in STRING
) RETURN SYS_REFCURSOR AS
    my_cursor SYS_REFCURSOR;
BEGIN

    OPEN my_cursor FOR
        SELECT distinct hs.ID        as "id",
                        hs.SHCC      as "shcc",
                        hs.GHI_CHU   as "ghiChu",
                        hs.HANH_DONG as "hanhDong",
                        hs.THOI_GIAN as "thoiGian",
                        cb.HO        as "ho",
                        cb.TEN       as "ten",
                        DMCV.TEN     as "chucVu",
                        usr.IMAGE    AS "image"


        FROM HCTH_HISTORY hs
                 LEFT JOIN TCHC_CAN_BO cb on hs.SHCC = cb.SHCC
                 LEFT JOIN QT_CHUC_VU qtcv ON cb.SHCC = qtcv.SHCC AND CHUC_VU_CHINH = 1
                 LEFT JOIN DM_CHUC_VU DMCV ON DMCV.MA = qtcv.MA_CHUC_VU
                 LEFT JOIN FW_USER usr on usr.SHCC = cb.shcc


        WHERE (target is not null and hs.KEY = target and loai is not null and targetType = hs.loai)
        ORDER BY
                 case
                     WHEN sortType = 'ASC' then hs.THOI_GIAN
                         ElSE 0 END,
                 hs.THOI_GIAN DESC;
    RETURN my_cursor;
END;

/
--EndMethod--

CREATE OR REPLACE FUNCTION HCTH_LIEN_KET_GET_ALL_FROM(
    targetA IN NUMBER,
    targetTypeA IN NVARCHAR2,
    targetB IN NUMBER,
    targetTypeB IN NVARCHAR2
) RETURN SYS_REFCURSOR AS
    my_cursor SYS_REFCURSOR;
BEGIN

    OPEN my_cursor FOR
        SELECT lk.ID                   as "id",
               lk.LOAI_A               as "loaiA",
               lk.KEY_A                as "keyA",
               lk.LOAI_B               as "loaiB",
               lk.KEY_B                as "keyB",
               hcthcvden.TRICH_YEU     as "trichYeuDen",
               hcthcvden.SO_CONG_VAN   as "soCongVanDen",
               hcthcvden.NGAY_NHAN     as "ngayNhan",
               hcthcvden.NGAY_CONG_VAN as "ngayCongVan",
               hcthcvden.SO_DEN        as "soDen",

               hcthcvdi.TRICH_YEU      as "trichYeuDi"
        FROM HCTH_LIEN_KET lk
                 LEFT JOIN HCTH_CONG_VAN_DEN hcthcvden ON hcthcvden.ID = lk.KEY_B and lk.LOAI_B = 'CONG_VAN_DEN'
                 LEFT JOIN HCTH_CONG_VAN_DI hcthcvdi ON hcthcvdi.ID = lk.KEY_B and lk.LOAI_B = 'CONG_VAN_DI'
        WHERE (targetA is null or lk.KEY_A = targetA)
          and (targetTypeA is null or lk.LOAI_A = targetTypeA)
          and (targetB is null or lk.KEY_B = targetB)
          and (targetTypeB is null or lk.LOAI_B = targetTypeB);
    RETURN my_cursor;
END;

/
--EndMethod--

CREATE OR REPLACE FUNCTION HCTH_NHIEM_VU_SEARCH_PAGE(
    pageNumber IN OUT NUMBER,
    pageSize IN OUT NUMBER,
    filterParam in STRING,
    searchTerm IN STRING,
    totalItem OUT NUMBER,
    pageTotal OUT NUMBER
) RETURN SYS_REFCURSOR AS
    my_cursor   SYS_REFCURSOR;
    sT          STRING(500) := '%' || lower(searchTerm) || '%';
    donViNhan   Number;
    canBoNhan   String(128);
    shccCanBo   String(32);
    nguoiTao    String(32);
    donViCanBo  String(128);
    canBoType   String(32);
    loaiNhiemVu String(32);
    lienPhong   Number(1);
    doUuTien    String(16);
BEGIN

    SELECT JSON_VALUE(filterParam, '$.donViNhan') INTO donViNhan FROM DUAL;
    SELECT JSON_VALUE(filterParam, '$.canBoNhan') INTO canBoNhan FROM DUAL;
    SELECT JSON_VALUE(filterParam, '$.shccCanBo') INTO shccCanBo FROM DUAL;
    SELECT JSON_VALUE(filterParam, '$.canBoType') INTO canBoType FROM DUAL;
    SELECT JSON_VALUE(filterParam, '$.donViCanBo') INTO donViCanBo FROM DUAL;
    SELECT JSON_VALUE(filterParam, '$.loaiNhiemVu') INTO loaiNhiemVu FROM DUAL;
    SELECT JSON_VALUE(filterParam, '$.lienPhong') INTO lienPhong FROM DUAL;
    SELECT JSON_VALUE(filterParam, '$.doUuTien') INTO doUuTien FROM DUAL;
    SELECT JSON_VALUE(filterParam, '$.nguoiTao') INTO nguoiTao FROM DUAL;


    SELECT COUNT(*)
    INTO totalItem
    FROM HCTH_NHIEM_VU nv
-- LEFT JOIN HCTH_CAN_BO_NHAN hcthcbn ON hcthcbn.KEY = nv.ID AND hcthcbn.LOAI = 'NHIEM_VU'
    WHERE
-- check if user is related to mission
        (
            -- RECTOR or HCTH staff can see all mission
                    canBoType = 'HCTH' or canBoType = 'RECTOR' OR
                -- other staff mission permission check
                    nv.NGUOI_TAO = shccCanBo or EXISTS(select cbn.id
                                                       from HCTH_CAN_BO_NHAN cbn
                                                       where cbn.LOAI = 'NHIEM_VU'
                                                         and cbn.MA = nv.ID
                                                         and cbn.CAN_BO_NHAN = shccCanBo)
                or (donViCanBo is not null and Exists(
                    select dvn.id
                    from HCTH_DON_VI_NHAN dvn
                    where dvn.MA = nv.id
                      and dvn.LOAI = 'NHIEM_VU'
                      and dvn.DON_VI_NHAN in
                          (select regexp_substr(donViCanBo, '[^,]+', 1, level)
                           from dual
                           connect by regexp_substr(donViCanBo, '[^,]+', 1, level) is not null)
                ))
            )
      and
      -- filter
        (
                    sT = ''
                OR LOWER(nv.NOI_DUNG) LIKE sT
                OR LOWER(nv.TIEU_DE) LIKE sT
            )
      and (
                loaiNhiemVu is NULL or
                (loaiNhiemVu = 'NHIEM_VU_CAC_DON_VI' and
                 Exists(SELECT dvn.id from HCTH_DON_VI_NHAN dvn where dvn.LOAI = 'NHIEM_VU' and dvn.MA = nv.id)) or
                (loaiNhiemVu = 'NHIEM_VU_DON_VI' and
                 (donViCanBo is not null and Exists(
                         select dvn.id
                         from HCTH_DON_VI_NHAN dvn
                         where dvn.MA = nv.id
                           and dvn.LOAI = 'NHIEM_VU'
                           and dvn.DON_VI_NHAN in
                               (select regexp_substr(donViCanBo, '[^,]+', 1, level)
                                from dual
                                connect by regexp_substr(donViCanBo, '[^,]+', 1, level) is not null)
                     ))) or
                (loaiNhiemVu = 'NHIEM_VU_CUA_BAN' and nv.NGUOI_TAO = shccCanBo) or
                (loaiNhiemVu = 'NHIEM_VU_THAM_GIA' and (EXISTS(select cbn.id
                                                               from HCTH_CAN_BO_NHAN cbn
                                                               where cbn.LOAI = 'NHIEM_VU'
                                                                 and cbn.MA = nv.ID
                                                                 and cbn.CAN_BO_NHAN = shccCanBo)
                    or (donViCanBo is not null and Exists(
                            select dvn.id
                            from HCTH_DON_VI_NHAN dvn
                            where dvn.MA = nv.id
                              and dvn.LOAI = 'NHIEM_VU'
                              and dvn.DON_VI_NHAN in
                                  (select regexp_substr(donViCanBo, '[^,]+', 1, level)
                                   from dual
                                   connect by regexp_substr(donViCanBo, '[^,]+', 1, level) is not null)
                        )))
                    ))
      and (
        lienPhong is NULL or nv.LIEN_PHONG = lienPhong
        )
      and (
        doUuTien is NULL or nv.DO_UU_TIEN = doUuTien
        )
      and (
                donViNhan is NULL or exists(select dvn.id
                                            from HCTH_DON_VI_NHAN dvn
                                            where dvn.LOAI = 'NHIEM_VU'
                                              and dvn.MA = nv.id
                                              and dvn.DON_VI_NHAN = donViNhan)
        )
      and (
                canBoNhan is NULL or exists(select cbn.id
                                            from HCTH_CAN_BO_NHAN cbn
                                            where cbn.LOAI = 'NHIEM_VU'
                                              and cbn.MA = nv.id
                                              and cbn.CAN_BO_NHAN = canBoNhan)
        )
      and (
        nguoiTao is NULL or nv.NGUOI_TAO = nguoiTao
        );
    IF pageNumber < 1 THEN
        pageNumber := 1;
    END IF;
    IF pageSize < 1 THEN
        pageSize := 1;
    END IF;
    pageTotal := CEIL(totalItem / pageSize);
    pageNumber := LEAST(pageNumber, pageTotal);

    OPEN my_cursor FOR
        SELECT *
        FROM (SELECT nv.ID                                                AS "id",
                     nv.TIEU_DE                                           AS "tieuDe",
                     nv.NOI_DUNG                                          AS "noiDung",
                     nv.NGAY_BAT_DAU                                      AS "ngayBatDau",
                     nv.NGAY_KET_THUC                                     AS "ngayKetThuc",
                     nv.NGAY_TAO                                          AS "ngayTao",
                     nv.DO_UU_TIEN                                        AS "doUuTien",
                     nv.DON_VI_NHAN                                       AS "maDonViNhan",
                     nv.NGUOI_TAO                                         AS "nguoiTao",
                     nv.LIEN_PHONG                                        AS "lienPhong",
                     nv.TRANG_THAI                                        AS "trangThai",

                     (select MAX(nvh.THOI_GIAN)
                      from HCTH_HISTORY nvh
                      where nvh.LOAI = 'NHIEM_VU'
                        and nvh.KEY = nv.ID)                              as chinhSuaLanCuoi,


                     (SELECT LISTAGG(dvn.TEN, '; ') WITHIN GROUP (
                         order by dvn.TEN
                         )
                      FROM DM_DON_VI dvn
                               LEFT JOIN HCTH_DON_VI_NHAN hcthdvn on dvn.MA = hcthdvn.DON_VI_NHAN
                      WHERE hcthdvn.MA = nv.ID
                        AND hcthdvn.LOAI = 'NHIEM_VU'
                     )                                                    AS "danhSachDonViNhan",


                     (SELECT LISTAGG(
                                     CASE
                                         WHEN cbn.HO IS NULL THEN cbn.TEN
                                         WHEN cbn.TEN IS NULL THEN cbn.HO
                                         ELSE CONCAT(CONCAT(cbn.HO, ' '), cbn.TEN)
                                         END,
                                     '; '
                                 ) WITHIN GROUP (
                                         order by cbn.TEN
                                         ) as "hoVaTenCanBo"
                      FROM TCHC_CAN_BO cbn
                               LEFT JOIN QT_CHUC_VU qtcv ON cbn.SHCC = qtcv.SHCC AND CHUC_VU_CHINH = 1
                               LEFT JOIN DM_CHUC_VU DMCV ON DMCV.MA = qtcv.MA_CHUC_VU
                      WHERE Exists(select hcthcbn.id
                                   from HCTH_CAN_BO_NHAN hcthcbn
                                   where hcthcbn.LOAI = 'NHIEM_VU'
                                     and hcthcbn.MA = nv.id
                                     and hcthcbn.CAN_BO_NHAN = cbn.SHCC)) as "danhSachCanBoNhan",


                     CASE
                         when nv.NGUOI_TAO is not null then
                             (SELECT (
                                         CASE
                                             WHEN cbn.HO IS NULL THEN cbn.TEN
                                             WHEN cbn.TEN IS NULL THEN cbn.HO
                                             ELSE CONCAT(CONCAT(cbn.HO, ' '), cbn.TEN)
                                             END
                                         )
                              FROM TCHC_CAN_BO cbn
                              WHERE nv.NGUOI_TAO = cbn.shcc) END          AS "tenNguoiTao",

                     ROW_NUMBER() OVER (
                         ORDER BY nv.ID DESC
                         )                                                   R
              FROM HCTH_NHIEM_VU nv
              WHERE
-- check if user is related to mission
                  (
                      -- RECTOR or HCTH staff can see all mission
                              canBoType = 'HCTH' or canBoType = 'RECTOR' OR
                          -- other staff mission permission check
                              nv.NGUOI_TAO = shccCanBo or EXISTS(select cbn.id
                                                                 from HCTH_CAN_BO_NHAN cbn
                                                                 where cbn.LOAI = 'NHIEM_VU'
                                                                   and cbn.MA = nv.ID
                                                                   and cbn.CAN_BO_NHAN = shccCanBo)
                          or (donViCanBo is not null and Exists(
                              select dvn.id
                              from HCTH_DON_VI_NHAN dvn
                              where dvn.MA = nv.id
                                and dvn.LOAI = 'NHIEM_VU'
                                and dvn.DON_VI_NHAN in
                                    (select regexp_substr(donViCanBo, '[^,]+', 1, level)
                                     from dual
                                     connect by regexp_substr(donViCanBo, '[^,]+', 1, level) is not null)
                          ))
                      )
                and
                -- filter
                  (
                              sT = ''
                          OR LOWER(nv.NOI_DUNG) LIKE sT
                          OR LOWER(nv.TIEU_DE) LIKE sT
                      )
                and (
                          loaiNhiemVu is NULL or
                          (loaiNhiemVu = 'NHIEM_VU_CAC_DON_VI' and
                           Exists(SELECT dvn.id
                                  from HCTH_DON_VI_NHAN dvn
                                  where dvn.LOAI = 'NHIEM_VU'
                                    and dvn.MA = nv.id)) or
                          (loaiNhiemVu = 'NHIEM_VU_DON_VI' and
                           (donViCanBo is not null and Exists(
                                   select dvn.id
                                   from HCTH_DON_VI_NHAN dvn
                                   where dvn.MA = nv.id
                                     and dvn.LOAI = 'NHIEM_VU'
                                     and dvn.DON_VI_NHAN in
                                         (select regexp_substr(donViCanBo, '[^,]+', 1, level)
                                          from dual
                                          connect by regexp_substr(donViCanBo, '[^,]+', 1, level) is not null)
                               ))) or
                          (loaiNhiemVu = 'NHIEM_VU_CUA_BAN' and nv.NGUOI_TAO = shccCanBo) or
                          (loaiNhiemVu = 'NHIEM_VU_THAM_GIA' and (EXISTS(select cbn.id
                                                                         from HCTH_CAN_BO_NHAN cbn
                                                                         where cbn.LOAI = 'NHIEM_VU'
                                                                           and cbn.MA = nv.ID
                                                                           and cbn.CAN_BO_NHAN = shccCanBo)
                              or (donViCanBo is not null and Exists(
                                      select dvn.id
                                      from HCTH_DON_VI_NHAN dvn
                                      where dvn.MA = nv.id
                                        and dvn.LOAI = 'NHIEM_VU'
                                        and dvn.DON_VI_NHAN in
                                            (select regexp_substr(donViCanBo, '[^,]+', 1, level)
                                             from dual
                                             connect by regexp_substr(donViCanBo, '[^,]+', 1, level) is not null)
                                  )))
                              ))
                and (
                  lienPhong is NULL or nv.LIEN_PHONG = lienPhong
                  )
                and (
                  doUuTien is NULL or nv.DO_UU_TIEN = doUuTien
                  )
                and (
                          donViNhan is NULL or exists(select dvn.id
                                                      from HCTH_DON_VI_NHAN dvn
                                                      where dvn.LOAI = 'NHIEM_VU'
                                                        and dvn.MA = nv.id
                                                        and dvn.DON_VI_NHAN = donViNhan)
                  )
                and (
                          canBoNhan is NULL or exists(select cbn.id
                                                      from HCTH_CAN_BO_NHAN cbn
                                                      where cbn.LOAI = 'NHIEM_VU'
                                                        and cbn.MA = nv.id
                                                        and cbn.CAN_BO_NHAN = canBoNhan)
                  )
                and (
                  nguoiTao is NULL or nv.NGUOI_TAO = nguoiTao
                  )
             )
        WHERE R BETWEEN (pageNumber - 1) * pageSize + 1 AND pageNumber * pageSize
        ORDER BY 'id' DESC;
    RETURN my_cursor;
END;

/
--EndMethod--

CREATE OR REPLACE FUNCTION HCTH_PHAN_HOI_GET_ALL_FROM(
    target IN NUMBER,
    targetType in STRING
) RETURN SYS_REFCURSOR AS
    my_cursor SYS_REFCURSOR;
BEGIN

    OPEN my_cursor FOR
        SELECT ph.ID         as "id",
               ph.NOI_DUNG   as "noiDung",
               ph.CAN_BO_GUI as "canBoGui",
               ph.NGAY_TAO   as "ngayTao",
               cb.HO         as "ho",
               cb.TEN        as "ten",
               DMCV.TEN      as "chucVu",
               usr.IMAGE     AS "image",
               fi.ID         AS "fileId",
               fi.TEN        AS "tenFile"


        FROM HCTH_PHAN_HOI ph
                 LEFT JOIN TCHC_CAN_BO cb on ph.CAN_BO_GUI = cb.SHCC
                 LEFT JOIN QT_CHUC_VU qtcv ON cb.SHCC = qtcv.SHCC AND CHUC_VU_CHINH = 1
                 LEFT JOIN DM_CHUC_VU DMCV ON DMCV.MA = qtcv.MA_CHUC_VU
                 LEFT JOIN FW_USER usr on usr.SHCC = cb.shcc
                 LEFT JOIN HCTH_FILE fi on fi.LOAI = 'PHAN_HOI' and fi.MA = ph.id


        WHERE (target is not null and ph.KEY = target and ph.loai is not null and targetType = ph.loai)
        ORDER BY NGAY_TAO;
    RETURN my_cursor;
END;

/
--EndMethod--

CREATE OR REPLACE PROCEDURE home_footer_swap_priority (p_ma in NUMBER, p_thu_tu in number, p_is_up in number)
IS
BEGIN
    IF p_is_up=1 THEN
        UPDATE FW_HOME_FOOTER SET PRIORITY=PRIORITY+1 WHERE PRIORITY >= p_thu_tu;
    ELSE
        UPDATE FW_HOME_FOOTER SET PRIORITY=PRIORITY-1 WHERE PRIORITY <= p_thu_tu;
    END IF;
    UPDATE FW_HOME_FOOTER SET PRIORITY=p_thu_tu WHERE ID=p_ma;
    commit;
END;

/
--EndMethod--

CREATE OR REPLACE FUNCTION menu_create_default (parent_id in number, title in nvarchar2, link in nvarchar2, active in number,maDonVi in nvarchar2,maWebsite in nvarchar2) RETURN NUMBER
IS
    maxPriority number;
    last_id FW_HOME_MENU.id%TYPE;
BEGIN
    begin
        select MAX(PRIORITY) into maxPriority from FW_HOME_MENU;
    exception
        when NO_DATA_FOUND then
        maxPriority := 0;
    end;
    if maxPriority is null then
        maxPriority := 0;
    end if;
    maxPriority := maxPriority+1;

    if parent_id is null then
        insert into FW_HOME_MENU (title, link, active,MA_DON_VI,MA_WEBSITE, priority) values (title, link, active, maDonVi,maWebsite, maxPriority)
        returning id into last_id;
    else
        insert into FW_HOME_MENU (parent_id, title, link, active,MA_DON_VI,MA_WEBSITE, priority) values (parent_id, title, link, active,maDonVi,maWebsite, maxPriority)
        returning id into last_id;
    end if;

    commit;
    return last_id;
END;

/
--EndMethod--

CREATE OR REPLACE FUNCTION QT_BAI_VIET_KHOA_HOC_DOWNLOAD_EXCEL(
    list_shcc IN STRING, list_dv IN STRING,
    fromYear IN NUMBER, toYear IN NUMBER, xuatBanRange IN NUMBER) RETURN SYS_REFCURSOR
AS
    my_cursor SYS_REFCURSOR;
BEGIN
    OPEN my_cursor FOR
        SELECT *
        FROM (
                 SELECT qtbvkh.ID           AS                         "id",
                        qtbvkh.TEN_TAC_GIA  AS                         "tenTacGia",
                        qtbvkh.NAM_XUAT_BAN AS                         "namXuatBan",
                        qtbvkh.TEN_BAI_VIET AS                         "tenBaiViet",
                        qtbvkh.TEN_TAP_CHI  AS                         "tenTapChi",
                        qtbvkh.SO_HIEU_ISSN AS                         "soHieuIssn",
                        qtbvkh.SAN_PHAM     AS                         "sanPham",
                        qtbvkh.DIEM_IF      AS                         "diemIf",
                        qtbvkh.QUOC_TE      AS                         "quocTe",
                        qtbvkh.SHCC         AS                         "shcc",

                        cb.HO               AS                         "hoCanBo",
                        cb.TEN              AS                         "tenCanBo",

                        dv.MA               AS                         "maDonVi",
                        dv.TEN              AS                         "tenDonVi",

                        ROW_NUMBER() OVER (ORDER BY NAM_XUAT_BAN DESC) R
                 FROM QT_BAI_VIET_KHOA_HOC qtbvkh
                          LEFT JOIN TCHC_CAN_BO cb on qtbvkh.SHCC = cb.SHCC
                          LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
                WHERE (((list_shcc IS NULL) AND (list_dv IS NULL) AND (fromYear IS NULL) AND (toYear IS NULL) AND (xuatBanRange IS NULL))
                    OR (((list_shcc IS NOT NULL AND cb.SHCC IN (SELECT regexp_substr(list_shcc, '[^,]+', 1, level) from dual connect by regexp_substr(list_shcc, '[^,]+', 1, level) is not null))
                  OR (list_dv IS NOT NULL AND cb.MA_DON_VI IN (SELECT regexp_substr(list_dv, '[^,]+', 1, level) from dual connect by regexp_substr(list_dv, '[^,]+', 1, level) is not null))
                  OR (list_shcc IS NULL AND list_dv IS NULL))
                  AND (qtbvkh.NAM_XUAT_BAN IS NOT NULL AND (fromYear IS NULL OR qtbvkh.NAM_XUAT_BAN >= fromYear))
                  AND (qtbvkh.NAM_XUAT_BAN IS NOT NULL AND (toYear IS NULL OR qtbvkh.NAM_XUAT_BAN <= toYear))
                  AND (xuatBanRange IS NULL OR (qtbvkh.QUOC_TE IS NOT NULL AND qtbvkh.QUOC_TE = xuatBanRange))))
                 ORDER BY qtbvkh.NAM_XUAT_BAN DESC
             );
    RETURN my_cursor;

END;

/
--EndMethod--

CREATE OR REPLACE FUNCTION QT_BAI_VIET_KHOA_HOC_GROUP_PAGE(pageNumber IN OUT NUMBER, pageSize IN OUT NUMBER,
                                                list_shcc IN STRING, list_dv IN STRING,
                                                fromYear IN NUMBER, toYear IN NUMBER, xuatBanRange IN NUMBER,
                                                searchTerm IN STRING,
                                                totalItem OUT NUMBER, pageTotal OUT NUMBER) RETURN SYS_REFCURSOR
AS
    my_cursor SYS_REFCURSOR;
    sT        STRING(500) := '%' || lower(searchTerm) || '%';
BEGIN
    SELECT COUNT(*)
    INTO totalItem

    FROM (SELECT *
          FROM QT_BAI_VIET_KHOA_HOC
          WHERE ID IN
                (SELECT MAX(ID) FROM (SELECT * FROM QT_BAI_VIET_KHOA_HOC ORDER BY SHCC DESC) GROUP BY SHCC)) qtbvkh
             LEFT JOIN TCHC_CAN_BO cb on qtbvkh.SHCC = cb.SHCC
             LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
             LEFT JOIN DM_TRINH_DO td ON (cb.HOC_VI = td.MA)
             LEFT JOIN DM_NGACH_CDNN cdnn ON (cdnn.MA = cb.NGACH);

    IF pageNumber < 1 THEN pageNumber := 1; END IF;
    IF pageSize < 1 THEN pageSize := 1; END IF;
    pageTotal := CEIL(totalItem / pageSize);
    pageNumber := LEAST(pageNumber, pageTotal);

    OPEN my_cursor FOR
        SELECT *
        FROM (SELECT qtbvkh.ID                                        AS "id",
                     qtbvkh.SHCC                                      AS "shcc",
                     (SELECT COUNT(*)
                      FROM QT_BAI_VIET_KHOA_HOC qtbvkh_temp
                               LEFT JOIN TCHC_CAN_BO cb on qtbvkh_temp.SHCC = cb.SHCC
                               LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
                      WHERE (qtbvkh_temp.SHCC = qtbvkh.SHCC)
                        AND (((list_shcc IS NULL) AND (list_dv IS NULL) AND (fromYear IS NULL) AND (toYear IS NULL) AND
                              (xuatBanRange IS NULL))
                          OR (((list_shcc IS NOT NULL AND cb.SHCC IN (SELECT regexp_substr(list_shcc, '[^,]+', 1, level)
                                                                      from dual
                                                                      connect by regexp_substr(list_shcc, '[^,]+', 1, level) is not null))
                              OR (list_dv IS NOT NULL AND
                                  cb.MA_DON_VI IN (SELECT regexp_substr(list_dv, '[^,]+', 1, level)
                                                   from dual
                                                   connect by regexp_substr(list_dv, '[^,]+', 1, level) is not null))
                              OR (list_shcc IS NULL AND list_dv IS NULL))
                              AND (qtbvkh_temp.NAM_XUAT_BAN IS NOT NULL AND
                                   (fromYear IS NULL OR qtbvkh_temp.NAM_XUAT_BAN >= fromYear))
                              AND (qtbvkh_temp.NAM_XUAT_BAN IS NOT NULL AND
                                   (toYear IS NULL OR qtbvkh_temp.NAM_XUAT_BAN <= toYear))
                              AND (xuatBanRange IS NULL OR
                                   (qtbvkh_temp.QUOC_TE IS NOT NULL AND qtbvkh_temp.QUOC_TE = xuatBanRange))))
                        AND (searchTerm = ''
                          OR LOWER(cb.SHCC) LIKE sT
                          OR LOWER(TRIM(cb.HO || ' ' || cb.TEN)) LIKE sT
                          OR LOWER(qtbvkh_temp.TEN_TAC_GIA) LIKE sT
                          OR LOWER(qtbvkh_temp.TEN_BAI_VIET) LIKE sT
                          OR LOWER(qtbvkh_temp.SO_HIEU_ISSN) LIKE sT
                          OR LOWER(qtbvkh_temp.TEN_TAP_CHI) LIKE sT)) AS "soBaiViet",

                     (select rtrim(xmlagg(xmlelement(e, qtbvkh_temp.TEN_BAI_VIET || ' ', '??').extract('//text()') order
                                          by null).getclobval(), '??')
                      FROM QT_BAI_VIET_KHOA_HOC qtbvkh_temp
                               LEFT JOIN TCHC_CAN_BO cb on qtbvkh_temp.SHCC = cb.SHCC
                               LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
                      WHERE (qtbvkh_temp.SHCC = qtbvkh.SHCC)
                        AND (((list_shcc IS NULL) AND (list_dv IS NULL) AND (fromYear IS NULL) AND (toYear IS NULL) AND
                              (xuatBanRange IS NULL))
                          OR (((list_shcc IS NOT NULL AND cb.SHCC IN (SELECT regexp_substr(list_shcc, '[^,]+', 1, level)
                                                                      from dual
                                                                      connect by regexp_substr(list_shcc, '[^,]+', 1, level) is not null))
                              OR (list_dv IS NOT NULL AND
                                  cb.MA_DON_VI IN (SELECT regexp_substr(list_dv, '[^,]+', 1, level)
                                                   from dual
                                                   connect by regexp_substr(list_dv, '[^,]+', 1, level) is not null))
                              OR (list_shcc IS NULL AND list_dv IS NULL))
                              AND (qtbvkh_temp.NAM_XUAT_BAN IS NOT NULL AND
                                   (fromYear IS NULL OR qtbvkh_temp.NAM_XUAT_BAN >= fromYear))
                              AND (qtbvkh_temp.NAM_XUAT_BAN IS NOT NULL AND
                                   (toYear IS NULL OR qtbvkh_temp.NAM_XUAT_BAN <= toYear))
                              AND (xuatBanRange IS NULL OR
                                   (qtbvkh_temp.QUOC_TE IS NOT NULL AND qtbvkh_temp.QUOC_TE = xuatBanRange))))
                        AND (searchTerm = ''
                          OR LOWER(cb.SHCC) LIKE sT
                          OR LOWER(TRIM(cb.HO || ' ' || cb.TEN)) LIKE sT
                          OR LOWER(qtbvkh_temp.TEN_TAC_GIA) LIKE sT
                          OR LOWER(qtbvkh_temp.TEN_BAI_VIET) LIKE sT
                          OR LOWER(qtbvkh_temp.SO_HIEU_ISSN) LIKE sT
                          OR LOWER(qtbvkh_temp.TEN_TAP_CHI) LIKE sT)) AS "danhSachBaiViet",

                     (select rtrim(xmlagg(xmlelement(e, qtbvkh_temp.NAM_XUAT_BAN || ' ', '??').extract('//text()') order
                                          by null).getclobval(), '??')
                      FROM QT_BAI_VIET_KHOA_HOC qtbvkh_temp
                               LEFT JOIN TCHC_CAN_BO cb on qtbvkh_temp.SHCC = cb.SHCC
                               LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
                      WHERE (qtbvkh_temp.SHCC = qtbvkh.SHCC)
                        AND (((list_shcc IS NULL) AND (list_dv IS NULL) AND (fromYear IS NULL) AND (toYear IS NULL) AND
                              (xuatBanRange IS NULL))
                          OR (((list_shcc IS NOT NULL AND cb.SHCC IN (SELECT regexp_substr(list_shcc, '[^,]+', 1, level)
                                                                      from dual
                                                                      connect by regexp_substr(list_shcc, '[^,]+', 1, level) is not null))
                              OR (list_dv IS NOT NULL AND
                                  cb.MA_DON_VI IN (SELECT regexp_substr(list_dv, '[^,]+', 1, level)
                                                   from dual
                                                   connect by regexp_substr(list_dv, '[^,]+', 1, level) is not null))
                              OR (list_shcc IS NULL AND list_dv IS NULL))
                              AND (qtbvkh_temp.NAM_XUAT_BAN IS NOT NULL AND
                                   (fromYear IS NULL OR qtbvkh_temp.NAM_XUAT_BAN >= fromYear))
                              AND (qtbvkh_temp.NAM_XUAT_BAN IS NOT NULL AND
                                   (toYear IS NULL OR qtbvkh_temp.NAM_XUAT_BAN <= toYear))
                              AND (xuatBanRange IS NULL OR
                                   (qtbvkh_temp.QUOC_TE IS NOT NULL AND qtbvkh_temp.QUOC_TE = xuatBanRange))))
                        AND (searchTerm = ''
                          OR LOWER(cb.SHCC) LIKE sT
                          OR LOWER(TRIM(cb.HO || ' ' || cb.TEN)) LIKE sT
                          OR LOWER(qtbvkh_temp.TEN_TAC_GIA) LIKE sT
                          OR LOWER(qtbvkh_temp.TEN_BAI_VIET) LIKE sT
                          OR LOWER(qtbvkh_temp.SO_HIEU_ISSN) LIKE sT
                          OR LOWER(qtbvkh_temp.TEN_TAP_CHI) LIKE sT)) AS "danhSachNamXuatBan",

                     cb.HO                                            AS "hoCanBo",
                     cb.TEN                                           AS "tenCanBo",

                     dv.MA                                            AS "maDonVi",
                     dv.TEN                                           AS "tenDonVi",

                     (SELECT DMCV.TEN
                      FROM QT_CHUC_VU QTCV
                               LEFT JOIN DM_CHUC_VU DMCV ON DMCV.MA = QTCV.MA_CHUC_VU
                      WHERE QTCV.SHCC = CB.SHCC
                        AND CHUC_VU_CHINH = 1)                        AS "tenChucVu",

                     (SELECT QTCV.MA_CHUC_VU
                      FROM QT_CHUC_VU QTCV
                      WHERE QTCV.SHCC = CB.SHCC
                        AND CHUC_VU_CHINH = 1)                        AS "maChucVu",
                     td.MA                                            AS "maHocVi",
                     td.TEN                                           AS "tenHocVi",

                     cdnn.MA                                          AS "maChucDanhNgheNghiep",
                     cdnn.TEN                                         AS "tenChucDanhNgheNghiep",
                     ROW_NUMBER() OVER (ORDER BY NAM_XUAT_BAN DESC)      R
              FROM (SELECT *
                    FROM QT_BAI_VIET_KHOA_HOC
                    WHERE ID IN (SELECT MAX(ID)
                                 FROM (SELECT * FROM QT_BAI_VIET_KHOA_HOC ORDER BY SHCC DESC)
                                 GROUP BY SHCC)) qtbvkh
                       LEFT JOIN TCHC_CAN_BO cb on qtbvkh.SHCC = cb.SHCC
                       LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
                       LEFT JOIN DM_TRINH_DO td ON (cb.HOC_VI = td.MA)
                       LEFT JOIN DM_NGACH_CDNN cdnn ON (cdnn.MA = cb.NGACH)
              ORDER BY qtbvkh.NAM_XUAT_BAN DESC)
        WHERE R BETWEEN (pageNumber - 1) * pageSize + 1 AND pageNumber * pageSize;
    RETURN my_cursor;

END;

/
--EndMethod--

CREATE OR REPLACE FUNCTION QT_BAI_VIET_KHOA_HOC_SEARCH_PAGE(pageNumber IN OUT NUMBER, pageSize IN OUT NUMBER,
                                                 list_shcc IN STRING, list_dv IN STRING,
                                                 fromYear IN NUMBER, toYear IN NUMBER, xuatBanRange IN NUMBER,
                                                 searchTerm IN STRING,
                                                 totalItem OUT NUMBER, pageTotal OUT NUMBER) RETURN SYS_REFCURSOR
AS
    my_cursor SYS_REFCURSOR;
    sT        STRING(500) := '%' || lower(searchTerm) || '%';
BEGIN
    SELECT COUNT(*)
    INTO totalItem

    FROM QT_BAI_VIET_KHOA_HOC qtbvkh
             LEFT JOIN TCHC_CAN_BO cb on qtbvkh.SHCC = cb.SHCC
             LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
             LEFT JOIN DM_TRINH_DO td ON (cb.HOC_VI = td.MA)
             LEFT JOIN DM_NGACH_CDNN cdnn ON (cdnn.MA = cb.NGACH)
    WHERE (((list_shcc IS NULL) AND (list_dv IS NULL) AND (fromYear IS NULL) AND (toYear IS NULL) AND
            (xuatBanRange IS NULL))
        OR (((list_shcc IS NOT NULL AND cb.SHCC IN (SELECT regexp_substr(list_shcc, '[^,]+', 1, level)
                                                    from dual
                                                    connect by regexp_substr(list_shcc, '[^,]+', 1, level) is not null))
            OR (list_dv IS NOT NULL AND cb.MA_DON_VI IN (SELECT regexp_substr(list_dv, '[^,]+', 1, level)
                                                         from dual
                                                         connect by regexp_substr(list_dv, '[^,]+', 1, level) is not null))
            OR (list_shcc IS NULL AND list_dv IS NULL))
            AND (qtbvkh.NAM_XUAT_BAN IS NOT NULL AND (fromYear IS NULL OR qtbvkh.NAM_XUAT_BAN >= fromYear))
            AND (qtbvkh.NAM_XUAT_BAN IS NOT NULL AND (toYear IS NULL OR qtbvkh.NAM_XUAT_BAN <= toYear))
            AND (xuatBanRange IS NULL OR (qtbvkh.QUOC_TE IS NOT NULL AND qtbvkh.QUOC_TE = xuatBanRange))))
      AND (searchTerm = ''
        OR LOWER(cb.SHCC) LIKE sT
        OR LOWER(TRIM(cb.HO || ' ' || cb.TEN)) LIKE sT
        OR LOWER(qtbvkh.TEN_TAC_GIA) LIKE sT
        OR LOWER(qtbvkh.TEN_BAI_VIET) LIKE sT
        OR LOWER(qtbvkh.SO_HIEU_ISSN) LIKE sT
        OR LOWER(qtbvkh.TEN_TAP_CHI) LIKE sT);

    IF pageNumber < 1 THEN pageNumber := 1; END IF;
    IF pageSize < 1 THEN pageSize := 1; END IF;
    pageTotal := CEIL(totalItem / pageSize);
    pageNumber := LEAST(pageNumber, pageTotal);

    OPEN my_cursor FOR
        SELECT *
        FROM (SELECT qtbvkh.ID                 AS                   "id",
                     qtbvkh.TEN_TAC_GIA        AS                   "tenTacGia",
                     qtbvkh.NAM_XUAT_BAN       AS                   "namXuatBan",
                     qtbvkh.TEN_BAI_VIET       AS                   "tenBaiViet",
                     qtbvkh.TEN_TAP_CHI        AS                   "tenTapChi",
                     qtbvkh.SO_HIEU_ISSN       AS                   "soHieuIssn",
                     qtbvkh.SAN_PHAM           AS                   "sanPham",
                     qtbvkh.DIEM_IF            AS                   "diemIf",
                     qtbvkh.QUOC_TE            AS                   "quocTe",
                     qtbvkh.SHCC               AS                   "shcc",

                     cb.HO                     AS                   "hoCanBo",
                     cb.TEN                    AS                   "tenCanBo",

                     dv.MA                     AS                   "maDonVi",
                     dv.TEN                    AS                   "tenDonVi",

                     (SELECT DMCV.TEN
                      FROM QT_CHUC_VU QTCV
                               LEFT JOIN DM_CHUC_VU DMCV ON DMCV.MA = QTCV.MA_CHUC_VU
                      WHERE QTCV.SHCC = CB.SHCC
                        AND CHUC_VU_CHINH = 1) AS                   "tenChucVu",

                     (SELECT QTCV.MA_CHUC_VU
                      FROM QT_CHUC_VU QTCV
                      WHERE QTCV.SHCC = CB.SHCC
                        AND CHUC_VU_CHINH = 1) AS                   "maChucVu",

                     td.MA                     AS                   "maHocVi",
                     td.TEN                    AS                   "tenHocVi",

                     cdnn.MA                   AS                   "maChucDanhNgheNghiep",
                     cdnn.TEN                  AS                   "tenChucDanhNgheNghiep",
                     ROW_NUMBER() OVER (ORDER BY NAM_XUAT_BAN DESC) R
              FROM QT_BAI_VIET_KHOA_HOC qtbvkh
                       LEFT JOIN TCHC_CAN_BO cb on qtbvkh.SHCC = cb.SHCC
                       LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
                       LEFT JOIN DM_TRINH_DO td ON (cb.HOC_VI = td.MA)
                       LEFT JOIN DM_NGACH_CDNN cdnn ON (cdnn.MA = cb.NGACH)
              WHERE (((list_shcc IS NULL) AND (list_dv IS NULL) AND (fromYear IS NULL) AND (toYear IS NULL) AND
                      (xuatBanRange IS NULL))
                  OR (((list_shcc IS NOT NULL AND cb.SHCC IN (SELECT regexp_substr(list_shcc, '[^,]+', 1, level)
                                                              from dual
                                                              connect by regexp_substr(list_shcc, '[^,]+', 1, level) is not null))
                      OR (list_dv IS NOT NULL AND cb.MA_DON_VI IN (SELECT regexp_substr(list_dv, '[^,]+', 1, level)
                                                                   from dual
                                                                   connect by regexp_substr(list_dv, '[^,]+', 1, level) is not null))
                      OR (list_shcc IS NULL AND list_dv IS NULL))
                      AND (qtbvkh.NAM_XUAT_BAN IS NOT NULL AND (fromYear IS NULL OR qtbvkh.NAM_XUAT_BAN >= fromYear))
                      AND (qtbvkh.NAM_XUAT_BAN IS NOT NULL AND (toYear IS NULL OR qtbvkh.NAM_XUAT_BAN <= toYear))
                      AND (xuatBanRange IS NULL OR (qtbvkh.QUOC_TE IS NOT NULL AND qtbvkh.QUOC_TE = xuatBanRange))))
                AND (searchTerm = ''
                  OR LOWER(cb.SHCC) LIKE sT
                  OR LOWER(TRIM(cb.HO || ' ' || cb.TEN)) LIKE sT
                  OR LOWER(qtbvkh.TEN_TAC_GIA) LIKE sT
                  OR LOWER(qtbvkh.TEN_BAI_VIET) LIKE sT
                  OR LOWER(qtbvkh.SO_HIEU_ISSN) LIKE sT
                  OR LOWER(qtbvkh.TEN_TAP_CHI) LIKE sT)
              ORDER BY qtbvkh.NAM_XUAT_BAN DESC)
        WHERE R BETWEEN (pageNumber - 1) * pageSize + 1 AND pageNumber * pageSize;
    RETURN my_cursor;

END;

/
--EndMethod--

CREATE OR REPLACE FUNCTION QT_BANG_PHAT_MINH_GROUP_PAGE(pageNumber IN OUT NUMBER, pageSize IN OUT NUMBER,
                                             list_shcc IN STRING, list_dv IN STRING,
                                             fromYear IN NUMBER, toYear IN NUMBER, searchTerm IN STRING,
                                             totalItem OUT NUMBER, pageTotal OUT NUMBER) RETURN SYS_REFCURSOR
AS
    my_cursor SYS_REFCURSOR;
    sT        STRING(500) := '%' || lower(searchTerm) || '%';
BEGIN
    SELECT COUNT(*)
    INTO totalItem
    FROM (SELECT *
          FROM QT_BANG_PHAT_MINH
          WHERE ID IN (SELECT MAX(ID) FROM (SELECT * FROM QT_BANG_PHAT_MINH ORDER BY SHCC DESC) GROUP BY SHCC)) qtbpm
             LEFT JOIN TCHC_CAN_BO cb on qtbpm.SHCC = cb.SHCC
             LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
             LEFT JOIN DM_TRINH_DO td ON (cb.HOC_VI = td.MA)
             LEFT JOIN DM_NGACH_CDNN cdnn ON (cdnn.MA = cb.NGACH);
    IF pageNumber < 1 THEN pageNumber := 1; END IF;
    IF pageSize < 1 THEN pageSize := 1; END IF;
    pageTotal := CEIL(totalItem / pageSize);
    pageNumber := LEAST(pageNumber, pageTotal);

    OPEN my_cursor FOR
        SELECT *
        FROM (SELECT qtbpm.ID                                     AS "id",
                     qtbpm.SHCC                                   AS "shcc",

                     cb.HO                                        AS "hoCanBo",
                     cb.TEN                                       AS "tenCanBo",

                     (SELECT COUNT(*)
                      FROM QT_BANG_PHAT_MINH qtbpm_temp
                               LEFT JOIN TCHC_CAN_BO cb on qtbpm_temp.SHCC = cb.SHCC
                               LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
                      WHERE (qtbpm_temp.SHCC = qtbpm.SHCC)
                        AND (((list_shcc IS NULL) AND (list_dv IS NULL) AND (fromYear IS NULL) AND (toYear IS NULL))
                          OR (((list_shcc IS NOT NULL AND cb.SHCC IN (SELECT regexp_substr(list_shcc, '[^,]+', 1, level)
                                                                      from dual
                                                                      connect by regexp_substr(list_shcc, '[^,]+', 1, level) is not null))
                              OR (list_dv IS NOT NULL AND
                                  cb.MA_DON_VI IN (SELECT regexp_substr(list_dv, '[^,]+', 1, level)
                                                   from dual
                                                   connect by regexp_substr(list_dv, '[^,]+', 1, level) is not null))
                              OR (list_shcc IS NULL AND list_dv IS NULL))
                              AND ((qtbpm_temp.NAM_CAP IS NOT NULL AND
                                    (fromYear IS NULL OR qtbpm_temp.NAM_CAP >= fromYear)) AND
                                   (toYear IS NULL OR qtbpm_temp.NAM_CAP <= toYear))))
                        AND (searchTerm = ''
                          OR LOWER(cb.SHCC) LIKE sT
                          OR LOWER(TRIM(cb.HO || ' ' || cb.TEN)) LIKE sT
                          OR LOWER(qtbpm_temp.TEN_BANG) LIKE sT
                          OR LOWER(qtbpm_temp.SO_HIEU) LIKE sT
                          OR LOWER(qtbpm_temp.TAC_GIA) LIKE sT
                          OR LOWER(qtbpm_temp.SAN_PHAM) LIKE sT)) AS "soBang",

                     (select rtrim(xmlagg(xmlelement(e, qtbpm_temp.TEN_BANG || ' ', '??').extract('//text()') order by
                                          null).getclobval(), '??')
                      FROM QT_BANG_PHAT_MINH qtbpm_temp
                               LEFT JOIN TCHC_CAN_BO cb on qtbpm_temp.SHCC = cb.SHCC
                               LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
                      WHERE (qtbpm_temp.SHCC = qtbpm.SHCC)
                        AND (((list_shcc IS NULL) AND (list_dv IS NULL) AND (fromYear IS NULL) AND (toYear IS NULL))
                          OR (((list_shcc IS NOT NULL AND cb.SHCC IN (SELECT regexp_substr(list_shcc, '[^,]+', 1, level)
                                                                      from dual
                                                                      connect by regexp_substr(list_shcc, '[^,]+', 1, level) is not null))
                              OR (list_dv IS NOT NULL AND
                                  cb.MA_DON_VI IN (SELECT regexp_substr(list_dv, '[^,]+', 1, level)
                                                   from dual
                                                   connect by regexp_substr(list_dv, '[^,]+', 1, level) is not null))
                              OR (list_shcc IS NULL AND list_dv IS NULL))
                              AND ((qtbpm_temp.NAM_CAP IS NOT NULL AND
                                    (fromYear IS NULL OR qtbpm_temp.NAM_CAP >= fromYear)) AND
                                   (toYear IS NULL OR qtbpm_temp.NAM_CAP <= toYear))))
                        AND (searchTerm = ''
                          OR LOWER(cb.SHCC) LIKE sT
                          OR LOWER(TRIM(cb.HO || ' ' || cb.TEN)) LIKE sT
                          OR LOWER(qtbpm_temp.TEN_BANG) LIKE sT
                          OR LOWER(qtbpm_temp.SO_HIEU) LIKE sT
                          OR LOWER(qtbpm_temp.TAC_GIA) LIKE sT
                          OR LOWER(qtbpm_temp.SAN_PHAM) LIKE sT)) AS "danhSachTenBang",

                     dv.MA                                        AS "maDonVi",
                     dv.TEN                                       AS "tenDonVi",

                     (SELECT DMCV.TEN
                      FROM QT_CHUC_VU QTCV
                               LEFT JOIN DM_CHUC_VU DMCV ON DMCV.MA = QTCV.MA_CHUC_VU
                      WHERE QTCV.SHCC = CB.SHCC
                        AND CHUC_VU_CHINH = 1)                    AS "tenChucVu",

                     (SELECT QTCV.MA_CHUC_VU
                      FROM QT_CHUC_VU QTCV
                      WHERE QTCV.SHCC = CB.SHCC
                        AND CHUC_VU_CHINH = 1)                    AS "maChucVu",

                     td.MA                                        AS "maHocVi",
                     td.TEN                                       AS "tenHocVi",

                     cdnn.MA                                      AS "maChucDanhNgheNghiep",
                     cdnn.TEN                                     AS "tenChucDanhNgheNghiep",
                     ROW_NUMBER() OVER (ORDER BY NAM_CAP DESC)       R
              FROM (SELECT *
                    FROM QT_BANG_PHAT_MINH
                    WHERE ID IN (SELECT MAX(ID)
                                 FROM (SELECT * FROM QT_BANG_PHAT_MINH ORDER BY SHCC DESC)
                                 GROUP BY SHCC)) qtbpm
                       LEFT JOIN TCHC_CAN_BO cb on qtbpm.SHCC = cb.SHCC
                       LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
                       LEFT JOIN DM_TRINH_DO td ON (cb.HOC_VI = td.MA)
                       LEFT JOIN DM_NGACH_CDNN cdnn ON (cdnn.MA = cb.NGACH)
              ORDER BY qtbpm.NAM_CAP DESC)
        WHERE R BETWEEN (pageNumber - 1) * pageSize + 1 AND pageNumber * pageSize;
    RETURN my_cursor;

END;

/
--EndMethod--

CREATE OR REPLACE FUNCTION QT_BANG_PHAT_MINH_SEARCH_PAGE(pageNumber IN OUT NUMBER, pageSize IN OUT NUMBER,
                                              list_shcc IN STRING, list_dv IN STRING,
                                              fromYear IN NUMBER, toYear IN NUMBER,
                                              searchTerm IN STRING,
                                              totalItem OUT NUMBER, pageTotal OUT NUMBER) RETURN SYS_REFCURSOR
AS
    my_cursor SYS_REFCURSOR;
    sT        STRING(500) := '%' || lower(searchTerm) || '%';
BEGIN
    SELECT COUNT(*)
    INTO totalItem

    FROM QT_BANG_PHAT_MINH qtbpm
             LEFT JOIN TCHC_CAN_BO cb on qtbpm.SHCC = cb.SHCC
             LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
             LEFT JOIN DM_TRINH_DO td ON (cb.HOC_VI = td.MA)
             LEFT JOIN DM_NGACH_CDNN cdnn ON (cdnn.MA = cb.NGACH)
    WHERE (((list_shcc IS NULL) AND (list_dv IS NULL) AND (fromYear IS NULL) AND (toYear IS NULL))
        OR (((list_shcc IS NOT NULL AND cb.SHCC IN (SELECT regexp_substr(list_shcc, '[^,]+', 1, level)
                                                    from dual
                                                    connect by regexp_substr(list_shcc, '[^,]+', 1, level) is not null))
            OR (list_dv IS NOT NULL AND cb.MA_DON_VI IN (SELECT regexp_substr(list_dv, '[^,]+', 1, level)
                                                         from dual
                                                         connect by regexp_substr(list_dv, '[^,]+', 1, level) is not null))
            OR (list_shcc IS NULL AND list_dv IS NULL))
            AND ((qtbpm.NAM_CAP IS NOT NULL AND (fromYear IS NULL OR qtbpm.NAM_CAP >= fromYear)) AND
                 (toYear IS NULL OR qtbpm.NAM_CAP <= toYear))))
      AND (searchTerm = ''
        OR LOWER(cb.SHCC) LIKE sT
        OR LOWER(TRIM(cb.HO || ' ' || cb.TEN)) LIKE sT
        OR LOWER(qtbpm.TEN_BANG) LIKE sT
        OR LOWER(qtbpm.SO_HIEU) LIKE sT
        OR LOWER(qtbpm.TAC_GIA) LIKE sT
        OR LOWER(qtbpm.SAN_PHAM) LIKE sT);

    IF pageNumber < 1 THEN pageNumber := 1; END IF;
    IF pageSize < 1 THEN pageSize := 1; END IF;
    pageTotal := CEIL(totalItem / pageSize);
    pageNumber := LEAST(pageNumber, pageTotal);

    OPEN my_cursor FOR
        SELECT *
        FROM (SELECT qtbpm.ID                  AS              "id",
                     qtbpm.SHCC                AS              "shcc",
                     qtbpm.TEN_BANG            AS              "tenBang",
                     qtbpm.SO_HIEU             AS              "soHieu",
                     qtbpm.NAM_CAP             AS              "namCap",
                     qtbpm.NOI_CAP             AS              "noiCap",
                     qtbpm.TAC_GIA             AS              "tacGia",
                     qtbpm.SAN_PHAM            AS              "sanPham",
                     qtbpm.LOAI_BANG           AS              "loaiBang",

                     cb.HO                     AS              "hoCanBo",
                     cb.TEN                    AS              "tenCanBo",

                     dv.MA                     AS              "maDonVi",
                     dv.TEN                    AS              "tenDonVi",

                     (SELECT DMCV.TEN
                      FROM QT_CHUC_VU QTCV
                               LEFT JOIN DM_CHUC_VU DMCV ON DMCV.MA = QTCV.MA_CHUC_VU
                      WHERE QTCV.SHCC = CB.SHCC
                        AND CHUC_VU_CHINH = 1) AS              "tenChucVu",

                     (SELECT QTCV.MA_CHUC_VU
                      FROM QT_CHUC_VU QTCV
                      WHERE QTCV.SHCC = CB.SHCC
                        AND CHUC_VU_CHINH = 1) AS              "maChucVu",
                     td.MA                     AS              "maHocVi",
                     td.TEN                    AS              "tenHocVi",

                     cdnn.MA                   AS              "maChucDanhNgheNghiep",
                     cdnn.TEN                  AS              "tenChucDanhNgheNghiep",
                     ROW_NUMBER() OVER (ORDER BY NAM_CAP DESC) R
              FROM QT_BANG_PHAT_MINH qtbpm
                       LEFT JOIN TCHC_CAN_BO cb on qtbpm.SHCC = cb.SHCC
                       LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
                       LEFT JOIN DM_TRINH_DO td ON (cb.HOC_VI = td.MA)
                       LEFT JOIN DM_NGACH_CDNN cdnn ON (cdnn.MA = cb.NGACH)
              WHERE (((list_shcc IS NULL) AND (list_dv IS NULL) AND (fromYear IS NULL) AND (toYear IS NULL))
                  OR (((list_shcc IS NOT NULL AND cb.SHCC IN (SELECT regexp_substr(list_shcc, '[^,]+', 1, level)
                                                              from dual
                                                              connect by regexp_substr(list_shcc, '[^,]+', 1, level) is not null))
                      OR (list_dv IS NOT NULL AND cb.MA_DON_VI IN (SELECT regexp_substr(list_dv, '[^,]+', 1, level)
                                                                   from dual
                                                                   connect by regexp_substr(list_dv, '[^,]+', 1, level) is not null))
                      OR (list_shcc IS NULL AND list_dv IS NULL))
                      AND ((qtbpm.NAM_CAP IS NOT NULL AND (fromYear IS NULL OR qtbpm.NAM_CAP >= fromYear)) AND
                           (toYear IS NULL OR qtbpm.NAM_CAP <= toYear))))
                AND (searchTerm = ''
                  OR LOWER(cb.SHCC) LIKE sT
                  OR LOWER(TRIM(cb.HO || ' ' || cb.TEN)) LIKE sT
                  OR LOWER(qtbpm.TEN_BANG) LIKE sT
                  OR LOWER(qtbpm.SO_HIEU) LIKE sT
                  OR LOWER(qtbpm.TAC_GIA) LIKE sT
                  OR LOWER(qtbpm.SAN_PHAM) LIKE sT)
              ORDER BY qtbpm.NOI_CAP DESC)
        WHERE R BETWEEN (pageNumber - 1) * pageSize + 1 AND pageNumber * pageSize;
    RETURN my_cursor;

END;

/
--EndMethod--

CREATE OR REPLACE FUNCTION QT_BAO_HIEM_XA_HOI_DOWNLOAD_EXCEL(list_shcc IN STRING, list_dv IN STRING,
                                        fromYear IN NUMBER, toYear IN NUMBER, timeType IN NUMBER, tinhTrang IN NUMBER) RETURN SYS_REFCURSOR
AS
    my_cursor SYS_REFCURSOR;
    today   NUMBER;
BEGIN
    select (cast(sysdate as date) - cast(to_date('1970-01-01', 'YYYY-MM-DD') as date)) * 86400000 into today from dual;
    OPEN my_cursor FOR
        SELECT *
        FROM (
                 SELECT
                        bhxh.ID             as  "id",
                        bhxh.SHCC           as  "shcc",
                        bhxh.BAT_DAU        as  "batDau",
                        bhxh.BAT_DAU_TYPE   as  "batDauType",
                        bhxh.KET_THUC       as  "ketThuc",
                        bhxh.KET_THUC_TYPE  as  "ketThucType",
                        bhxh.CHUC_VU        as  "chucVu",
                        bhxh.MUC_DONG       as  "mucDong",
                        bhxh.PHU_CAP_CHUC_VU    as  "phuCapChucVu",
                        bhxh.PHU_CAP_THAM_NIEN_VUOT_KHUNG   as  "phuCapThamNienVuotKhung",
                        bhxh.PHU_CAP_THAM_NIEN_NGHE     as  "phuCapThamNienNghe",
                        bhxh.TY_LE_DONG     as  "tyLeDong",

                        today as "today",

                        cb.TEN             as   "tenCanBo",
                        cb.HO              as   "hoCanBo",

                        cv.MA               as  "maChucVu",
                        cv.TEN              as  "tenChucVu",

                        dv.MA              AS                       "maDonVi",
                        dv.TEN             AS                       "tenDonVi",

                        ROW_NUMBER() OVER (ORDER BY bhxh.BAT_DAU DESC ) R
                 FROM QT_BAO_HIEM_XA_HOI bhxh
                          LEFT JOIN TCHC_CAN_BO cb on bhxh.SHCC = cb.SHCC
                          LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
                          LEFT JOIN DM_CHUC_VU cv on bhxh.CHUC_VU = cv.MA
                WHERE (((list_shcc IS NULL) AND (list_dv IS NULL) AND (fromYear IS NULL) AND (toYear IS NULL) AND (timeType = 0) AND (tinhTrang IS NULL))
                    OR (((list_shcc IS NOT NULL AND ((INSTR(list_shcc, ',') != 0 AND INSTR(list_shcc, bhxh.SHCC) != 0) OR (list_shcc = bhxh.SHCC)))
                  OR (list_dv IS NOT NULL AND INSTR(list_dv, cb.MA_DON_VI) != 0)
                  OR (list_shcc IS NULL AND list_dv IS NULL))
                  AND (timeType = 0 OR (
                        timeType = 1 AND (bhxh.BAT_DAU IS NOT NULL AND (fromYear IS NULL OR bhxh.BAT_DAU >= fromYear)) AND (toYear IS NULL OR bhxh.BAT_DAU <= toYear)
                      ))
                  AND (tinhTrang IS NULL OR ((bhxh.KET_THUC = -1 OR bhxh.KET_THUC >= today) AND tinhTrang = 2) OR
                       (bhxh.KET_THUC IS NOT NULL AND bhxh.KET_THUC != -1 AND bhxh.KET_THUC < today AND tinhTrang = 1))))
                 ORDER BY bhxh.BAT_DAU DESC
             );
    RETURN my_cursor;

END;

/
--EndMethod--

CREATE OR REPLACE FUNCTION QT_BAO_HIEM_XA_HOI_GROUP_PAGE(pageNumber IN OUT NUMBER, pageSize IN OUT NUMBER,
                                        list_shcc IN STRING, list_dv IN STRING,
                                        fromYear IN NUMBER, toYear IN NUMBER, timeType IN NUMBER, tinhTrang IN NUMBER, searchTerm IN STRING,
                                         totalItem OUT NUMBER, pageTotal OUT NUMBER) RETURN SYS_REFCURSOR
AS
    my_cursor SYS_REFCURSOR;
    sT        STRING(500) := '%' || lower(searchTerm) || '%';
    today   NUMBER;
BEGIN
    select (cast(sysdate as date) - cast(to_date('1970-01-01', 'YYYY-MM-DD') as date)) * 86400000 into today from dual;
    SELECT COUNT(*)
    INTO totalItem

    FROM (SELECT *
          FROM QT_BAO_HIEM_XA_HOI
          WHERE ID IN (SELECT MAX(ID) FROM (SELECT * FROM QT_BAO_HIEM_XA_HOI ORDER BY SHCC DESC) GROUP BY SHCC)) bhxh
              LEFT JOIN TCHC_CAN_BO cb on bhxh.SHCC = cb.SHCC
              LEFT JOIN DM_CHUC_VU cv on bhxh.CHUC_VU = cv.MA;

    IF pageNumber < 1 THEN pageNumber := 1; END IF;
    IF pageSize < 1 THEN pageSize := 1; END IF;
    pageTotal := CEIL(totalItem / pageSize);
    pageNumber := LEAST(pageNumber, pageTotal);

    OPEN my_cursor FOR
        SELECT *
        FROM (
                 SELECT
                        bhxh.ID             as  "id",
                        bhxh.SHCC           as  "shcc",

                        (SELECT COUNT(*)
                        FROM QT_BAO_HIEM_XA_HOI bhxh_temp
                                 LEFT JOIN TCHC_CAN_BO cb on bhxh_temp.SHCC = cb.SHCC
                                 LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
                                 LEFT JOIN DM_CHUC_VU cv on bhxh_temp.CHUC_VU = cv.MA
                        WHERE (bhxh_temp.SHCC = bhxh.SHCC)
                            AND (((list_shcc IS NULL) AND (list_dv IS NULL) AND (fromYear IS NULL) AND (toYear IS NULL) AND (timeType = 0) AND (tinhTrang IS NULL))
                            OR (((list_shcc IS NOT NULL AND ((INSTR(list_shcc, ',') != 0 AND INSTR(list_shcc, bhxh_temp.SHCC) != 0) OR (list_shcc = bhxh_temp.SHCC)))
                          OR (list_dv IS NOT NULL AND INSTR(list_dv, cb.MA_DON_VI) != 0)
                          OR (list_shcc IS NULL AND list_dv IS NULL))
                          AND (timeType = 0 OR (
                                timeType = 1 AND (bhxh_temp.BAT_DAU IS NOT NULL AND (fromYear IS NULL OR bhxh_temp.BAT_DAU >= fromYear)) AND (toYear IS NULL OR bhxh_temp.BAT_DAU <= toYear)
                              ))
                          AND (tinhTrang IS NULL OR ((bhxh_temp.KET_THUC = -1 OR bhxh_temp.KET_THUC >= today) AND tinhTrang = 2) OR
                               (bhxh_temp.KET_THUC IS NOT NULL AND bhxh_temp.KET_THUC != -1 AND bhxh_temp.KET_THUC < today AND tinhTrang = 1))))
                          AND (searchTerm = ''
                            OR LOWER(cb.SHCC) LIKE sT
                            OR LOWER(TRIM(cb.HO || ' ' || cb.TEN)) LIKE sT
                            OR LOWER(cv.TEN) LIKE sT)
                        ) AS "soQuaTrinh",

                        (select rtrim(xmlagg(xmlelement(e, bhxh_temp.BAT_DAU || ' ','??').extract('//text()') order by null).getclobval(),'??')
                        FROM QT_BAO_HIEM_XA_HOI bhxh_temp
                                 LEFT JOIN TCHC_CAN_BO cb on bhxh_temp.SHCC = cb.SHCC
                                 LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
                                 LEFT JOIN DM_CHUC_VU cv on bhxh_temp.CHUC_VU = cv.MA
                        WHERE (bhxh_temp.SHCC = bhxh.SHCC)
                            AND (((list_shcc IS NULL) AND (list_dv IS NULL) AND (fromYear IS NULL) AND (toYear IS NULL) AND (timeType = 0) AND (tinhTrang IS NULL))
                            OR (((list_shcc IS NOT NULL AND ((INSTR(list_shcc, ',') != 0 AND INSTR(list_shcc, bhxh_temp.SHCC) != 0) OR (list_shcc = bhxh_temp.SHCC)))
                          OR (list_dv IS NOT NULL AND INSTR(list_dv, cb.MA_DON_VI) != 0)
                          OR (list_shcc IS NULL AND list_dv IS NULL))
                          AND (timeType = 0 OR (
                                timeType = 1 AND (bhxh_temp.BAT_DAU IS NOT NULL AND (fromYear IS NULL OR bhxh_temp.BAT_DAU >= fromYear)) AND (toYear IS NULL OR bhxh_temp.BAT_DAU <= toYear)
                              ))
                          AND (tinhTrang IS NULL OR ((bhxh_temp.KET_THUC = -1 OR bhxh_temp.KET_THUC >= today) AND tinhTrang = 2) OR
                               (bhxh_temp.KET_THUC IS NOT NULL AND bhxh_temp.KET_THUC != -1 AND bhxh_temp.KET_THUC < today AND tinhTrang = 1))))
                          AND (searchTerm = ''
                            OR LOWER(cb.SHCC) LIKE sT
                            OR LOWER(TRIM(cb.HO || ' ' || cb.TEN)) LIKE sT
                            OR LOWER(cv.TEN) LIKE sT)
                        ) AS "danhSachBatDau",

                        (select rtrim(xmlagg(xmlelement(e, bhxh_temp.KET_THUC || ' ','??').extract('//text()') order by null).getclobval(),'??')
                        FROM QT_BAO_HIEM_XA_HOI bhxh_temp
                                 LEFT JOIN TCHC_CAN_BO cb on bhxh_temp.SHCC = cb.SHCC
                                 LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
                                 LEFT JOIN DM_CHUC_VU cv on bhxh_temp.CHUC_VU = cv.MA
                        WHERE (bhxh_temp.SHCC = bhxh.SHCC)
                            AND (((list_shcc IS NULL) AND (list_dv IS NULL) AND (fromYear IS NULL) AND (toYear IS NULL) AND (timeType = 0) AND (tinhTrang IS NULL))
                            OR (((list_shcc IS NOT NULL AND ((INSTR(list_shcc, ',') != 0 AND INSTR(list_shcc, bhxh_temp.SHCC) != 0) OR (list_shcc = bhxh_temp.SHCC)))
                          OR (list_dv IS NOT NULL AND INSTR(list_dv, cb.MA_DON_VI) != 0)
                          OR (list_shcc IS NULL AND list_dv IS NULL))
                          AND (timeType = 0 OR (
                                timeType = 1 AND (bhxh_temp.BAT_DAU IS NOT NULL AND (fromYear IS NULL OR bhxh_temp.BAT_DAU >= fromYear)) AND (toYear IS NULL OR bhxh_temp.BAT_DAU <= toYear)
                              ))
                          AND (tinhTrang IS NULL OR ((bhxh_temp.KET_THUC = -1 OR bhxh_temp.KET_THUC >= today) AND tinhTrang = 2) OR
                               (bhxh_temp.KET_THUC IS NOT NULL AND bhxh_temp.KET_THUC != -1 AND bhxh_temp.KET_THUC < today AND tinhTrang = 1))))
                          AND (searchTerm = ''
                            OR LOWER(cb.SHCC) LIKE sT
                            OR LOWER(TRIM(cb.HO || ' ' || cb.TEN)) LIKE sT
                            OR LOWER(cv.TEN) LIKE sT)
                        ) AS "danhSachKetThuc",

                        (select rtrim(xmlagg(xmlelement(e, bhxh_temp.KET_THUC_TYPE || ' ','??').extract('//text()') order by null).getclobval(),'??')
                        FROM QT_BAO_HIEM_XA_HOI bhxh_temp
                                 LEFT JOIN TCHC_CAN_BO cb on bhxh_temp.SHCC = cb.SHCC
                                 LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
                                 LEFT JOIN DM_CHUC_VU cv on bhxh_temp.CHUC_VU = cv.MA
                        WHERE (bhxh_temp.SHCC = bhxh.SHCC)
                            AND (((list_shcc IS NULL) AND (list_dv IS NULL) AND (fromYear IS NULL) AND (toYear IS NULL) AND (timeType = 0) AND (tinhTrang IS NULL))
                            OR (((list_shcc IS NOT NULL AND ((INSTR(list_shcc, ',') != 0 AND INSTR(list_shcc, bhxh_temp.SHCC) != 0) OR (list_shcc = bhxh_temp.SHCC)))
                          OR (list_dv IS NOT NULL AND INSTR(list_dv, cb.MA_DON_VI) != 0)
                          OR (list_shcc IS NULL AND list_dv IS NULL))
                          AND (timeType = 0 OR (
                                timeType = 1 AND (bhxh_temp.BAT_DAU IS NOT NULL AND (fromYear IS NULL OR bhxh_temp.BAT_DAU >= fromYear)) AND (toYear IS NULL OR bhxh_temp.BAT_DAU <= toYear)
                              ))
                          AND (tinhTrang IS NULL OR ((bhxh_temp.KET_THUC = -1 OR bhxh_temp.KET_THUC >= today) AND tinhTrang = 2) OR
                               (bhxh_temp.KET_THUC IS NOT NULL AND bhxh_temp.KET_THUC != -1 AND bhxh_temp.KET_THUC < today AND tinhTrang = 1))))
                          AND (searchTerm = ''
                            OR LOWER(cb.SHCC) LIKE sT
                            OR LOWER(TRIM(cb.HO || ' ' || cb.TEN)) LIKE sT
                            OR LOWER(cv.TEN) LIKE sT)
                        ) AS "danhSachKetThucType",

                        (select rtrim(xmlagg(xmlelement(e, bhxh_temp.BAT_DAU_TYPE || ' ','??').extract('//text()') order by null).getclobval(),'??')
                        FROM QT_BAO_HIEM_XA_HOI bhxh_temp
                                 LEFT JOIN TCHC_CAN_BO cb on bhxh_temp.SHCC = cb.SHCC
                                 LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
                                 LEFT JOIN DM_CHUC_VU cv on bhxh_temp.CHUC_VU = cv.MA
                        WHERE (bhxh_temp.SHCC = bhxh.SHCC)
                            AND (((list_shcc IS NULL) AND (list_dv IS NULL) AND (fromYear IS NULL) AND (toYear IS NULL) AND (timeType = 0) AND (tinhTrang IS NULL))
                            OR (((list_shcc IS NOT NULL AND ((INSTR(list_shcc, ',') != 0 AND INSTR(list_shcc, bhxh_temp.SHCC) != 0) OR (list_shcc = bhxh_temp.SHCC)))
                          OR (list_dv IS NOT NULL AND INSTR(list_dv, cb.MA_DON_VI) != 0)
                          OR (list_shcc IS NULL AND list_dv IS NULL))
                          AND (timeType = 0 OR (
                                timeType = 1 AND (bhxh_temp.BAT_DAU IS NOT NULL AND (fromYear IS NULL OR bhxh_temp.BAT_DAU >= fromYear)) AND (toYear IS NULL OR bhxh_temp.BAT_DAU <= toYear)
                              ))
                          AND (tinhTrang IS NULL OR ((bhxh_temp.KET_THUC = -1 OR bhxh_temp.KET_THUC >= today) AND tinhTrang = 2) OR
                               (bhxh_temp.KET_THUC IS NOT NULL AND bhxh_temp.KET_THUC != -1 AND bhxh_temp.KET_THUC < today AND tinhTrang = 1))))
                          AND (searchTerm = ''
                            OR LOWER(cb.SHCC) LIKE sT
                            OR LOWER(TRIM(cb.HO || ' ' || cb.TEN)) LIKE sT
                            OR LOWER(cv.TEN) LIKE sT)
                        ) AS "danhSachBatDauType",

                        cb.TEN             as   "tenCanBo",
                        cb.HO              as   "hoCanBo",

                        cv.MA               as  "maChucVu",
                        cv.TEN              as  "tenChucVu",
                        ROW_NUMBER() OVER (ORDER BY bhxh.BAT_DAU DESC ) R
                     FROM (SELECT *
                          FROM QT_BAO_HIEM_XA_HOI
                          WHERE ID IN (SELECT MAX(ID) FROM (SELECT * FROM QT_BAO_HIEM_XA_HOI ORDER BY SHCC DESC) GROUP BY SHCC)) bhxh
                              LEFT JOIN TCHC_CAN_BO cb on bhxh.SHCC = cb.SHCC
                              LEFT JOIN DM_CHUC_VU cv on bhxh.CHUC_VU = cv.MA
                ORDER BY bhxh.BAT_DAU DESC
             )
        WHERE R BETWEEN (pageNumber - 1) * pageSize + 1 AND pageNumber * pageSize;
    RETURN my_cursor;

END;

/
--EndMethod--

CREATE OR REPLACE FUNCTION QT_BAO_HIEM_XA_HOI_SEARCH_PAGE(pageNumber IN OUT NUMBER, pageSize IN OUT NUMBER,
                                        list_shcc IN STRING, list_dv IN STRING,
                                        fromYear IN NUMBER, toYear IN NUMBER, timeType IN NUMBER, tinhTrang IN NUMBER, searchTerm IN STRING,
                                         totalItem OUT NUMBER, pageTotal OUT NUMBER) RETURN SYS_REFCURSOR
AS
    my_cursor SYS_REFCURSOR;
    sT        STRING(500) := '%' || lower(searchTerm) || '%';
    today   NUMBER;
BEGIN
    select (cast(sysdate as date) - cast(to_date('1970-01-01', 'YYYY-MM-DD') as date)) * 86400000 into today from dual;
    SELECT COUNT(*)
    INTO totalItem

    FROM QT_BAO_HIEM_XA_HOI bhxh
             LEFT JOIN TCHC_CAN_BO cb on bhxh.SHCC = cb.SHCC
             LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
             LEFT JOIN DM_CHUC_VU cv on bhxh.CHUC_VU = cv.MA
    WHERE (((list_shcc IS NULL) AND (list_dv IS NULL) AND (fromYear IS NULL) AND (toYear IS NULL) AND (timeType = 0) AND (tinhTrang IS NULL))
        OR (((list_shcc IS NOT NULL AND ((INSTR(list_shcc, ',') != 0 AND INSTR(list_shcc, bhxh.SHCC) != 0) OR (list_shcc = bhxh.SHCC)))
      OR (list_dv IS NOT NULL AND INSTR(list_dv, cb.MA_DON_VI) != 0)
      OR (list_shcc IS NULL AND list_dv IS NULL))
      AND (timeType = 0 OR (
            timeType = 1 AND (bhxh.BAT_DAU IS NOT NULL AND (fromYear IS NULL OR bhxh.BAT_DAU >= fromYear)) AND (toYear IS NULL OR bhxh.BAT_DAU <= toYear)
          ))
      AND (tinhTrang IS NULL OR ((bhxh.KET_THUC = -1 OR bhxh.KET_THUC >= today) AND tinhTrang = 2) OR
           (bhxh.KET_THUC IS NOT NULL AND bhxh.KET_THUC != -1 AND bhxh.KET_THUC < today AND tinhTrang = 1))))
      AND (searchTerm = ''
        OR LOWER(cb.SHCC) LIKE sT
        OR LOWER(TRIM(cb.HO || ' ' || cb.TEN)) LIKE sT
        OR LOWER(cv.TEN) LIKE sT);

    IF pageNumber < 1 THEN pageNumber := 1; END IF;
    IF pageSize < 1 THEN pageSize := 1; END IF;
    pageTotal := CEIL(totalItem / pageSize);
    pageNumber := LEAST(pageNumber, pageTotal);

    OPEN my_cursor FOR
        SELECT *
        FROM (
                 SELECT
                        bhxh.ID             as  "id",
                        bhxh.SHCC           as  "shcc",
                        bhxh.BAT_DAU        as  "batDau",
                        bhxh.BAT_DAU_TYPE   as  "batDauType",
                        bhxh.KET_THUC       as  "ketThuc",
                        bhxh.KET_THUC_TYPE  as  "ketThucType",
                        bhxh.CHUC_VU        as  "chucVu",
                        bhxh.MUC_DONG       as  "mucDong",
                        bhxh.PHU_CAP_CHUC_VU    as  "phuCapChucVu",
                        bhxh.PHU_CAP_THAM_NIEN_VUOT_KHUNG   as  "phuCapThamNienVuotKhung",
                        bhxh.PHU_CAP_THAM_NIEN_NGHE     as  "phuCapThamNienNghe",
                        bhxh.TY_LE_DONG     as  "tyLeDong",

                        today as "today",

                        cb.TEN             as   "tenCanBo",
                        cb.HO              as   "hoCanBo",

                        cv.MA               as  "maChucVu",
                        cv.TEN              as  "tenChucVu",

                        dv.MA              AS                       "maDonVi",
                        dv.TEN             AS                       "tenDonVi",

                        ROW_NUMBER() OVER (ORDER BY bhxh.BAT_DAU DESC ) R
                 FROM QT_BAO_HIEM_XA_HOI bhxh
                          LEFT JOIN TCHC_CAN_BO cb on bhxh.SHCC = cb.SHCC
                          LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
                          LEFT JOIN DM_CHUC_VU cv on bhxh.CHUC_VU = cv.MA
                WHERE (((list_shcc IS NULL) AND (list_dv IS NULL) AND (fromYear IS NULL) AND (toYear IS NULL) AND (timeType = 0) AND (tinhTrang IS NULL))
                    OR (((list_shcc IS NOT NULL AND ((INSTR(list_shcc, ',') != 0 AND INSTR(list_shcc, bhxh.SHCC) != 0) OR (list_shcc = bhxh.SHCC)))
                  OR (list_dv IS NOT NULL AND INSTR(list_dv, cb.MA_DON_VI) != 0)
                  OR (list_shcc IS NULL AND list_dv IS NULL))
                  AND (timeType = 0 OR (
                        timeType = 1 AND (bhxh.BAT_DAU IS NOT NULL AND (fromYear IS NULL OR bhxh.BAT_DAU >= fromYear)) AND (toYear IS NULL OR bhxh.BAT_DAU <= toYear)
                      ))
                  AND (tinhTrang IS NULL OR ((bhxh.KET_THUC = -1 OR bhxh.KET_THUC >= today) AND tinhTrang = 2) OR
                       (bhxh.KET_THUC IS NOT NULL AND bhxh.KET_THUC != -1 AND bhxh.KET_THUC < today AND tinhTrang = 1))))
                  AND (searchTerm = ''
                    OR LOWER(cb.SHCC) LIKE sT
                    OR LOWER(TRIM(cb.HO || ' ' || cb.TEN)) LIKE sT
                    OR LOWER(cv.TEN) LIKE sT)
                 ORDER BY bhxh.BAT_DAU DESC
             )
        WHERE R BETWEEN (pageNumber - 1) * pageSize + 1 AND pageNumber * pageSize;
    RETURN my_cursor;

END;

/
--EndMethod--

CREATE OR REPLACE FUNCTION QT_CHUC_VU_DOWNLOAD_EXCEL(list_shcc IN STRING, list_dv IN STRING,
                                        fromYear IN NUMBER, toYear IN NUMBER, timeType IN NUMBER, list_cv IN STRING,
                                        gioiTinh IN STRING) RETURN SYS_REFCURSOR
AS
    my_cursor SYS_REFCURSOR;
BEGIN
    OPEN my_cursor FOR
        SELECT *
        FROM (
                 SELECT qtcv.SHCC                    AS       "shcc",
                        qtcv.STT                     AS       "stt",
                        cb.HO                        AS       "ho",
                        cb.TEN                       AS       "ten",
                        cb.PHAI AS "gioiTinh",
                        cb.NGAY_SINH    AS "ngaySinh",
                        cb.NGACH                     AS       "ngach",
                        cb.HOC_VI                    AS       "hocVi",
                        dnc.TEN                      AS        "tenChucDanhNgheNghiep",
                        (SELECT (cv.TEN || ' ??' || dv.TEN || ' ??' || bm.TEN || ' ??' || (qtcv_temp.NGAY_RA_QD) || ' ??' || qtcv_temp.SO_QD || ' ??' || cv.PHU_CAP || ' ')
                        FROM QT_CHUC_VU qtcv_temp
                                 LEFT JOIN TCHC_CAN_BO cb on qtcv_temp.SHCC = cb.SHCC
                                 LEFT JOIN DM_CHUC_VU cv ON qtcv_temp.MA_CHUC_VU = cv.MA
                                 LEFT JOIN DM_DON_VI dv ON qtcv_temp.MA_DON_VI = dv.MA
                                 LEFT JOIN DM_BO_MON bm ON qtcv_temp.MA_BO_MON = bm.MA
                        WHERE (qtcv_temp.SHCC = qtcv.SHCC)
                            AND (qtcv_temp.CHUC_VU_CHINH = 1)
                            AND ((list_shcc IS NOT NULL AND INSTR(list_shcc, qtcv_temp.SHCC) != 0)
                          OR (list_dv IS NOT NULL AND INSTR(list_dv, cb.MA_DON_VI) != 0)
                          OR (list_shcc IS NULL AND list_dv IS NULL))
                          AND (gioiTinh IS NULL OR (cb.PHAI = gioiTinh))
                          AND (timeType = 0 OR (timeType = 1 AND
                                (fromYear IS NULL OR qtcv_temp.NGAY_RA_QD IS NULL OR qtcv_temp.NGAY_RA_QD >= fromYear) AND (toYear IS NULL OR qtcv_temp.NGAY_RA_QD IS NULL OR qtcv_temp.NGAY_RA_QD <= toYear))
                              OR ((timeType = 2) AND
                                  (fromYear IS NULL OR qtcv_temp.NGAY_THOI_CHUC_VU IS NULL OR qtcv_temp.NGAY_THOI_CHUC_VU >= fromYear) AND (toYear IS NULL OR qtcv_temp.NGAY_THOI_CHUC_VU IS NULL OR qtcv_temp.NGAY_THOI_CHUC_VU <= toYear))
                              OR ((timeType = 3) AND
                                  (fromYear IS NULL OR qtcv_temp.NGAY_RA_QD_THOI_CHUC_VU IS NULL OR qtcv_temp.NGAY_RA_QD_THOI_CHUC_VU >= fromYear) AND (toYear IS NULL OR qtcv_temp.NGAY_RA_QD_THOI_CHUC_VU IS NULL OR qtcv_temp.NGAY_RA_QD <= toYear))
                              )
                            AND (list_cv IS NULL OR (list_cv IS NOT NULL AND INSTR(list_cv, qtcv_temp.MA_CHUC_VU) != 0))
                        ) AS "itemChinh",
                        (SELECT COUNT(*)
                        FROM QT_CHUC_VU qtcv_temp
                                 LEFT JOIN TCHC_CAN_BO cb on qtcv_temp.SHCC = cb.SHCC
                                 LEFT JOIN DM_CHUC_VU cv ON qtcv_temp.MA_CHUC_VU = cv.MA
                                 LEFT JOIN DM_DON_VI dv ON qtcv_temp.MA_DON_VI = dv.MA
                                 LEFT JOIN DM_BO_MON bm ON qtcv_temp.MA_BO_MON = bm.MA
                        WHERE (qtcv_temp.SHCC = qtcv.SHCC)
                            AND (qtcv_temp.CHUC_VU_CHINH = 0)
                            AND ((list_shcc IS NOT NULL AND INSTR(list_shcc, qtcv_temp.SHCC) != 0)
                          OR (list_dv IS NOT NULL AND INSTR(list_dv, cb.MA_DON_VI) != 0)
                          OR (list_shcc IS NULL AND list_dv IS NULL))
                          AND (gioiTinh IS NULL OR (cb.PHAI = gioiTinh))
                          AND (timeType = 0 OR (timeType = 1 AND
                                (fromYear IS NULL OR qtcv_temp.NGAY_RA_QD IS NULL OR qtcv_temp.NGAY_RA_QD >= fromYear) AND (toYear IS NULL OR qtcv_temp.NGAY_RA_QD IS NULL OR qtcv_temp.NGAY_RA_QD <= toYear))
                              OR ((timeType = 2) AND
                                  (fromYear IS NULL OR qtcv_temp.NGAY_THOI_CHUC_VU IS NULL OR qtcv_temp.NGAY_THOI_CHUC_VU >= fromYear) AND (toYear IS NULL OR qtcv_temp.NGAY_THOI_CHUC_VU IS NULL OR qtcv_temp.NGAY_THOI_CHUC_VU <= toYear))
                              OR ((timeType = 3) AND
                                  (fromYear IS NULL OR qtcv_temp.NGAY_RA_QD_THOI_CHUC_VU IS NULL OR qtcv_temp.NGAY_RA_QD_THOI_CHUC_VU >= fromYear) AND (toYear IS NULL OR qtcv_temp.NGAY_RA_QD_THOI_CHUC_VU IS NULL OR qtcv_temp.NGAY_RA_QD <= toYear))
                              )
                            AND (list_cv IS NULL OR (list_cv IS NOT NULL AND INSTR(list_cv, qtcv_temp.MA_CHUC_VU) != 0))
                        ) AS "soChucVuKiemNhiem",
                        (select rtrim(xmlagg(xmlelement(e, cv.TEN || ' ','??').extract('//text()') order by null).getclobval(),'??')
                        FROM QT_CHUC_VU qtcv_temp
                                 LEFT JOIN TCHC_CAN_BO cb on qtcv_temp.SHCC = cb.SHCC
                                 LEFT JOIN DM_CHUC_VU cv ON qtcv_temp.MA_CHUC_VU = cv.MA
                                 LEFT JOIN DM_DON_VI dv ON qtcv_temp.MA_DON_VI = dv.MA
                                 LEFT JOIN DM_BO_MON bm ON qtcv_temp.MA_BO_MON = bm.MA
                        WHERE (qtcv_temp.SHCC = qtcv.SHCC)
                            AND (qtcv_temp.CHUC_VU_CHINH = 0)
                            AND ((list_shcc IS NOT NULL AND INSTR(list_shcc, qtcv_temp.SHCC) != 0)
                          OR (list_dv IS NOT NULL AND INSTR(list_dv, cb.MA_DON_VI) != 0)
                          OR (list_shcc IS NULL AND list_dv IS NULL))
                          AND (gioiTinh IS NULL OR (cb.PHAI = gioiTinh))
                          AND (timeType = 0 OR (timeType = 1 AND
                                (fromYear IS NULL OR qtcv_temp.NGAY_RA_QD IS NULL OR qtcv_temp.NGAY_RA_QD >= fromYear) AND (toYear IS NULL OR qtcv_temp.NGAY_RA_QD IS NULL OR qtcv_temp.NGAY_RA_QD <= toYear))
                              OR ((timeType = 2) AND
                                  (fromYear IS NULL OR qtcv_temp.NGAY_THOI_CHUC_VU IS NULL OR qtcv_temp.NGAY_THOI_CHUC_VU >= fromYear) AND (toYear IS NULL OR qtcv_temp.NGAY_THOI_CHUC_VU IS NULL OR qtcv_temp.NGAY_THOI_CHUC_VU <= toYear))
                              OR ((timeType = 3) AND
                                  (fromYear IS NULL OR qtcv_temp.NGAY_RA_QD_THOI_CHUC_VU IS NULL OR qtcv_temp.NGAY_RA_QD_THOI_CHUC_VU >= fromYear) AND (toYear IS NULL OR qtcv_temp.NGAY_RA_QD_THOI_CHUC_VU IS NULL OR qtcv_temp.NGAY_RA_QD <= toYear))
                              )
                            AND (list_cv IS NULL OR (list_cv IS NOT NULL AND INSTR(list_cv, qtcv_temp.MA_CHUC_VU) != 0))
                        ) AS "danhSachChucVuKiemNhiem",
                        (select rtrim(xmlagg(xmlelement(e, qtcv.SO_QD || ' ','??').extract('//text()') order by null).getclobval(),'??')
                        FROM QT_CHUC_VU qtcv_temp
                                 LEFT JOIN TCHC_CAN_BO cb on qtcv_temp.SHCC = cb.SHCC
                                 LEFT JOIN DM_CHUC_VU cv ON qtcv_temp.MA_CHUC_VU = cv.MA
                                 LEFT JOIN DM_DON_VI dv ON qtcv_temp.MA_DON_VI = dv.MA
                                 LEFT JOIN DM_BO_MON bm ON qtcv_temp.MA_BO_MON = bm.MA
                        WHERE (qtcv_temp.SHCC = qtcv.SHCC)
                            AND (qtcv_temp.CHUC_VU_CHINH = 0)
                            AND ((list_shcc IS NOT NULL AND INSTR(list_shcc, qtcv_temp.SHCC) != 0)
                          OR (list_dv IS NOT NULL AND INSTR(list_dv, cb.MA_DON_VI) != 0)
                          OR (list_shcc IS NULL AND list_dv IS NULL))
                          AND (gioiTinh IS NULL OR (cb.PHAI = gioiTinh))
                          AND (timeType = 0 OR (timeType = 1 AND
                                (fromYear IS NULL OR qtcv_temp.NGAY_RA_QD IS NULL OR qtcv_temp.NGAY_RA_QD >= fromYear) AND (toYear IS NULL OR qtcv_temp.NGAY_RA_QD IS NULL OR qtcv_temp.NGAY_RA_QD <= toYear))
                              OR ((timeType = 2) AND
                                  (fromYear IS NULL OR qtcv_temp.NGAY_THOI_CHUC_VU IS NULL OR qtcv_temp.NGAY_THOI_CHUC_VU >= fromYear) AND (toYear IS NULL OR qtcv_temp.NGAY_THOI_CHUC_VU IS NULL OR qtcv_temp.NGAY_THOI_CHUC_VU <= toYear))
                              OR ((timeType = 3) AND
                                  (fromYear IS NULL OR qtcv_temp.NGAY_RA_QD_THOI_CHUC_VU IS NULL OR qtcv_temp.NGAY_RA_QD_THOI_CHUC_VU >= fromYear) AND (toYear IS NULL OR qtcv_temp.NGAY_RA_QD_THOI_CHUC_VU IS NULL OR qtcv_temp.NGAY_RA_QD <= toYear))
                              )
                            AND (list_cv IS NULL OR (list_cv IS NOT NULL AND INSTR(list_cv, qtcv_temp.MA_CHUC_VU) != 0))
                        ) AS "danhSachSoQdKiemNhiem",
                        (select rtrim(xmlagg(xmlelement(e, qtcv.NGAY_RA_QD || ' ','??').extract('//text()') order by null).getclobval(),'??')
                        FROM QT_CHUC_VU qtcv_temp
                                 LEFT JOIN TCHC_CAN_BO cb on qtcv_temp.SHCC = cb.SHCC
                                 LEFT JOIN DM_CHUC_VU cv ON qtcv_temp.MA_CHUC_VU = cv.MA
                                 LEFT JOIN DM_DON_VI dv ON qtcv_temp.MA_DON_VI = dv.MA
                                 LEFT JOIN DM_BO_MON bm ON qtcv_temp.MA_BO_MON = bm.MA
                        WHERE (qtcv_temp.SHCC = qtcv.SHCC)
                            AND (qtcv_temp.CHUC_VU_CHINH = 0)
                            AND ((list_shcc IS NOT NULL AND INSTR(list_shcc, qtcv_temp.SHCC) != 0)
                          OR (list_dv IS NOT NULL AND INSTR(list_dv, cb.MA_DON_VI) != 0)
                          OR (list_shcc IS NULL AND list_dv IS NULL))
                          AND (gioiTinh IS NULL OR (cb.PHAI = gioiTinh))
                          AND (timeType = 0 OR (timeType = 1 AND
                                (fromYear IS NULL OR qtcv_temp.NGAY_RA_QD IS NULL OR qtcv_temp.NGAY_RA_QD >= fromYear) AND (toYear IS NULL OR qtcv_temp.NGAY_RA_QD IS NULL OR qtcv_temp.NGAY_RA_QD <= toYear))
                              OR ((timeType = 2) AND
                                  (fromYear IS NULL OR qtcv_temp.NGAY_THOI_CHUC_VU IS NULL OR qtcv_temp.NGAY_THOI_CHUC_VU >= fromYear) AND (toYear IS NULL OR qtcv_temp.NGAY_THOI_CHUC_VU IS NULL OR qtcv_temp.NGAY_THOI_CHUC_VU <= toYear))
                              OR ((timeType = 3) AND
                                  (fromYear IS NULL OR qtcv_temp.NGAY_RA_QD_THOI_CHUC_VU IS NULL OR qtcv_temp.NGAY_RA_QD_THOI_CHUC_VU >= fromYear) AND (toYear IS NULL OR qtcv_temp.NGAY_RA_QD_THOI_CHUC_VU IS NULL OR qtcv_temp.NGAY_RA_QD <= toYear))
                              )
                            AND (list_cv IS NULL OR (list_cv IS NOT NULL AND INSTR(list_cv, qtcv_temp.MA_CHUC_VU) != 0))
                        ) AS "danhSachNgayQdKiemNhiem",
                        (select rtrim(xmlagg(xmlelement(e, cv.PHU_CAP || ' ','??').extract('//text()') order by null).getclobval(),'??')
                        FROM QT_CHUC_VU qtcv_temp
                                 LEFT JOIN TCHC_CAN_BO cb on qtcv_temp.SHCC = cb.SHCC
                                 LEFT JOIN DM_CHUC_VU cv ON qtcv_temp.MA_CHUC_VU = cv.MA
                                 LEFT JOIN DM_DON_VI dv ON qtcv_temp.MA_DON_VI = dv.MA
                                 LEFT JOIN DM_BO_MON bm ON qtcv_temp.MA_BO_MON = bm.MA
                        WHERE (qtcv_temp.SHCC = qtcv.SHCC)
                            AND (qtcv_temp.CHUC_VU_CHINH = 0)
                            AND ((list_shcc IS NOT NULL AND INSTR(list_shcc, qtcv_temp.SHCC) != 0)
                          OR (list_dv IS NOT NULL AND INSTR(list_dv, cb.MA_DON_VI) != 0)
                          OR (list_shcc IS NULL AND list_dv IS NULL))
                          AND (gioiTinh IS NULL OR (cb.PHAI = gioiTinh))
                          AND (timeType = 0 OR (timeType = 1 AND
                                (fromYear IS NULL OR qtcv_temp.NGAY_RA_QD IS NULL OR qtcv_temp.NGAY_RA_QD >= fromYear) AND (toYear IS NULL OR qtcv_temp.NGAY_RA_QD IS NULL OR qtcv_temp.NGAY_RA_QD <= toYear))
                              OR ((timeType = 2) AND
                                  (fromYear IS NULL OR qtcv_temp.NGAY_THOI_CHUC_VU IS NULL OR qtcv_temp.NGAY_THOI_CHUC_VU >= fromYear) AND (toYear IS NULL OR qtcv_temp.NGAY_THOI_CHUC_VU IS NULL OR qtcv_temp.NGAY_THOI_CHUC_VU <= toYear))
                              OR ((timeType = 3) AND
                                  (fromYear IS NULL OR qtcv_temp.NGAY_RA_QD_THOI_CHUC_VU IS NULL OR qtcv_temp.NGAY_RA_QD_THOI_CHUC_VU >= fromYear) AND (toYear IS NULL OR qtcv_temp.NGAY_RA_QD_THOI_CHUC_VU IS NULL OR qtcv_temp.NGAY_RA_QD <= toYear))
                              )
                            AND (list_cv IS NULL OR (list_cv IS NOT NULL AND INSTR(list_cv, qtcv_temp.MA_CHUC_VU) != 0))
                        ) AS "danhSachHeSoPhuCapKiemNhiem",
                        (select rtrim(xmlagg(xmlelement(e, dv.TEN || ' ','??').extract('//text()') order by null).getclobval(),'??')
                        FROM QT_CHUC_VU qtcv_temp
                                 LEFT JOIN TCHC_CAN_BO cb on qtcv_temp.SHCC = cb.SHCC
                                 LEFT JOIN DM_CHUC_VU cv ON qtcv_temp.MA_CHUC_VU = cv.MA
                                 LEFT JOIN DM_DON_VI dv ON qtcv_temp.MA_DON_VI = dv.MA
                                 LEFT JOIN DM_BO_MON bm ON qtcv_temp.MA_BO_MON = bm.MA
                        WHERE (qtcv_temp.SHCC = qtcv.SHCC)
                            AND (qtcv_temp.CHUC_VU_CHINH = 0)
                            AND ((list_shcc IS NOT NULL AND INSTR(list_shcc, qtcv_temp.SHCC) != 0)
                          OR (list_dv IS NOT NULL AND INSTR(list_dv, cb.MA_DON_VI) != 0)
                          OR (list_shcc IS NULL AND list_dv IS NULL))
                          AND (gioiTinh IS NULL OR (cb.PHAI = gioiTinh))
                          AND (timeType = 0 OR (timeType = 1 AND
                                (fromYear IS NULL OR qtcv_temp.NGAY_RA_QD IS NULL OR qtcv_temp.NGAY_RA_QD >= fromYear) AND (toYear IS NULL OR qtcv_temp.NGAY_RA_QD IS NULL OR qtcv_temp.NGAY_RA_QD <= toYear))
                              OR ((timeType = 2) AND
                                  (fromYear IS NULL OR qtcv_temp.NGAY_THOI_CHUC_VU IS NULL OR qtcv_temp.NGAY_THOI_CHUC_VU >= fromYear) AND (toYear IS NULL OR qtcv_temp.NGAY_THOI_CHUC_VU IS NULL OR qtcv_temp.NGAY_THOI_CHUC_VU <= toYear))
                              OR ((timeType = 3) AND
                                  (fromYear IS NULL OR qtcv_temp.NGAY_RA_QD_THOI_CHUC_VU IS NULL OR qtcv_temp.NGAY_RA_QD_THOI_CHUC_VU >= fromYear) AND (toYear IS NULL OR qtcv_temp.NGAY_RA_QD_THOI_CHUC_VU IS NULL OR qtcv_temp.NGAY_RA_QD <= toYear))
                              )
                            AND (list_cv IS NULL OR (list_cv IS NOT NULL AND INSTR(list_cv, qtcv_temp.MA_CHUC_VU) != 0))
                        ) AS "danhSachDonViKiemNhiem",
                        (select rtrim(xmlagg(xmlelement(e, bm.TEN || ' ','??').extract('//text()') order by null).getclobval(),'??')
                        FROM QT_CHUC_VU qtcv_temp
                                 LEFT JOIN TCHC_CAN_BO cb on qtcv_temp.SHCC = cb.SHCC
                                 LEFT JOIN DM_CHUC_VU cv ON qtcv_temp.MA_CHUC_VU = cv.MA
                                 LEFT JOIN DM_DON_VI dv ON qtcv_temp.MA_DON_VI = dv.MA
                                 LEFT JOIN DM_BO_MON bm ON qtcv_temp.MA_BO_MON = bm.MA
                        WHERE (qtcv_temp.SHCC = qtcv.SHCC)
                            AND (qtcv_temp.CHUC_VU_CHINH = 0)
                            AND ((list_shcc IS NOT NULL AND INSTR(list_shcc, qtcv_temp.SHCC) != 0)
                          OR (list_dv IS NOT NULL AND INSTR(list_dv, cb.MA_DON_VI) != 0)
                          OR (list_shcc IS NULL AND list_dv IS NULL))
                          AND (gioiTinh IS NULL OR (cb.PHAI = gioiTinh))
                          AND (timeType = 0 OR (timeType = 1 AND
                                (fromYear IS NULL OR qtcv_temp.NGAY_RA_QD IS NULL OR qtcv_temp.NGAY_RA_QD >= fromYear) AND (toYear IS NULL OR qtcv_temp.NGAY_RA_QD IS NULL OR qtcv_temp.NGAY_RA_QD <= toYear))
                              OR ((timeType = 2) AND
                                  (fromYear IS NULL OR qtcv_temp.NGAY_THOI_CHUC_VU IS NULL OR qtcv_temp.NGAY_THOI_CHUC_VU >= fromYear) AND (toYear IS NULL OR qtcv_temp.NGAY_THOI_CHUC_VU IS NULL OR qtcv_temp.NGAY_THOI_CHUC_VU <= toYear))
                              OR ((timeType = 3) AND
                                  (fromYear IS NULL OR qtcv_temp.NGAY_RA_QD_THOI_CHUC_VU IS NULL OR qtcv_temp.NGAY_RA_QD_THOI_CHUC_VU >= fromYear) AND (toYear IS NULL OR qtcv_temp.NGAY_RA_QD_THOI_CHUC_VU IS NULL OR qtcv_temp.NGAY_RA_QD <= toYear))
                              )
                            AND (list_cv IS NULL OR (list_cv IS NOT NULL AND INSTR(list_cv, qtcv_temp.MA_CHUC_VU) != 0))
                        ) AS "danhSachBoMonKiemNhiem",
                        ROW_NUMBER() OVER (ORDER BY qtcv.MA_CHUC_VU ASC) R
                FROM (SELECT *
                   FROM QT_CHUC_VU
                   WHERE STT IN
                         (SELECT MAX(STT) FROM (SELECT * FROM QT_CHUC_VU ORDER BY SHCC ASC ) GROUP BY SHCC)) qtcv
                          LEFT JOIN TCHC_CAN_BO cb on qtcv.SHCC = cb.SHCC
                          LEFT JOIN DM_DON_VI dv ON cb.MA_DON_VI = dv.MA
                          LEFT JOIN DM_CHUC_DANH_NGHE_NGHIEP dnc on cb.NGACH = dnc.MA
                 ORDER BY QTCV.MA_CHUC_VU ASC
             );
    RETURN my_cursor;

END;

/
--EndMethod--

CREATE OR REPLACE FUNCTION QT_CHUC_VU_GET_BY_SHCC(isSHCC in STRING) RETURN SYS_REFCURSOR
AS
    my_cursor SYS_REFCURSOR;
BEGIN
    OPEN my_cursor FOR
        SELECT qtcv.SHCC                    AS                       "shcc",
               qtcv.STT                     AS                       "stt",
               cb.HO                        AS                       "ho",
               cb.TEN                       AS                       "ten",
               cv.PHU_CAP                   AS                       "phuCap",
               qtcv.MA_DON_VI               AS                       "maDonVi",
               dv.TEN                       AS                       "tenDonVi",
               qtcv.MA_BO_MON               AS                       "maBoMon",
               bm.TEN                       AS                       "tenBoMon",
               qtcv.MA_CHUC_VU              AS                       "maChucVu",
               cv.TEN                       AS                       "tenChucVu",
               qtcv.SO_QD                   AS                       "soQuyetDinh",
               cv.LOAI_CHUC_VU              AS                       "loaiChucVu",
               qtcv.NGAY_RA_QD              AS                       "ngayRaQuyetDinh",
               qtcv.CHUC_VU_CHINH           AS                       "chucVuChinh",
               qtcv.THOI_CHUC_VU            AS                       "thoiChucVu",
               qtcv.SO_QD_THOI_CHUC_VU      AS                       "soQdThoiChucVu",
               qtcv.NGAY_THOI_CHUC_VU       AS                       "ngayThoiChucVu",
               qtcv.NGAY_RA_QD_THOI_CHUC_VU AS                       "ngayRaQdThoiChucVu",
               ROW_NUMBER() OVER (ORDER BY qtcv.CHUC_VU_CHINH DESC ) R

        FROM QT_CHUC_VU qtcv
                 LEFT JOIN TCHC_CAN_BO cb ON qtcv.SHCC = cb.SHCC
                 LEFT JOIN DM_CHUC_VU cv ON cv.MA = qtcv.MA_CHUC_VU
                 LEFT JOIN DM_DON_VI dv ON dv.MA = qtcv.MA_DON_VI
                 LEFT JOIN DM_BO_MON bm ON qtcv.MA_BO_MON = bm.MA
        WHERE qtcv.SHCC = isSHCC
        ORDER BY CHUC_VU_CHINH DESC;
    RETURN my_cursor;
END;

/
--EndMethod--

CREATE OR REPLACE FUNCTION QT_CHUC_VU_GROUP_PAGE(pageNumber IN OUT NUMBER, pageSize IN OUT NUMBER,
                                      filter IN STRING, searchTerm IN STRING,
                                      totalItem OUT NUMBER, pageTotal OUT NUMBER) RETURN SYS_REFCURSOR
AS
    my_cursor    SYS_REFCURSOR;
    sT           STRING(500) := '%' || lower(searchTerm) || '%';
    listShcc     STRING(255);
    listDonVi    STRING(255);
    fromYear     NUMBER(20);
    toYear       NUMBER(20);
    timeType     NUMBER(20);
    listChucVu   STRING(255);
    listChucDanh STRING(255);
    gioiTinh     STRING(255);
    fromAge      NUMBER(20);
    toAge        NUMBER(20);
BEGIN
    SELECT JSON_VALUE(filter, '$.listShcc') INTO listShcc FROM DUAL;
    SELECT JSON_VALUE(filter, '$.listDonVi') INTO listDonVi FROM DUAL;
    SELECT JSON_VALUE(filter, '$.fromYear' RETURNING NUMBER) INTO fromYear FROM DUAL;
    SELECT JSON_VALUE(filter, '$.toYear' RETURNING NUMBER) INTO toYear FROM DUAL;
    SELECT JSON_VALUE(filter, '$.timeType' RETURNING NUMBER) INTO timeType FROM DUAL;
    SELECT JSON_VALUE(filter, '$.listChucVu') INTO listChucVu FROM DUAL;
    SELECT JSON_VALUE(filter, '$.listChucDanh') INTO listChucDanh FROM DUAL;
    SELECT JSON_VALUE(filter, '$.gioiTinh') INTO gioiTinh FROM DUAL;
    SELECT JSON_VALUE(filter, '$.fromAge' RETURNING NUMBER) INTO fromAge FROM DUAL;
    SELECT JSON_VALUE(filter, '$.toAge' RETURNING NUMBER) INTO toAge FROM DUAL;

    SELECT COUNT(DISTINCT qtcv.SHCC)
    INTO totalItem
    FROM QT_CHUC_VU qtcv
             LEFT JOIN TCHC_CAN_BO cb on qtcv.SHCC = cb.SHCC
             LEFT JOIN DM_CHUC_VU cv ON qtcv.MA_CHUC_VU = cv.MA
             LEFT JOIN DM_DON_VI dv ON qtcv.MA_DON_VI = dv.MA
             LEFT JOIN DM_BO_MON bm ON qtcv.MA_BO_MON = bm.MA
             LEFT JOIN DM_NGACH_CDNN cdnn on cb.NGACH = cdnn.MA
    WHERE ((listShcc IS NOT NULL AND
            qtcv.SHCC IN (SELECT regexp_substr(listShcc, '[^,]+', 1, level)
                          from dual
                          connect by regexp_substr(listShcc, '[^,]+', 1, level) is not null))
        OR (listDonVi IS NOT NULL AND
            qtcv.MA_DON_VI IN (SELECT regexp_substr(listDonVi, '[^,]+', 1, level)
                               from dual
                               connect by regexp_substr(listDonVi, '[^,]+', 1, level) is not null))
        OR (listShcc IS NULL AND listDonVi IS NULL))
      AND (gioiTinh IS NULL OR (cb.PHAI = gioiTinh))
      AND (timeType = 0 OR timeType IS NULL OR (timeType = 1 AND
                                                (fromYear IS NULL OR fromYear = 0 OR
                                                 qtcv.NGAY_RA_QD IS NULL OR
                                                 qtcv.NGAY_RA_QD >= fromYear) AND
                                                (toYear IS NULL OR toYear = 0 OR
                                                 qtcv.NGAY_RA_QD IS NULL OR
                                                 qtcv.NGAY_RA_QD <= toYear))
        OR ((timeType = 2) AND
            (fromYear IS NULL OR fromYear = 0 OR qtcv.NGAY_THOI_CHUC_VU IS NULL OR
             qtcv.NGAY_THOI_CHUC_VU >= fromYear) AND
            (toYear IS NULL OR toYear = 0 OR qtcv.NGAY_THOI_CHUC_VU IS NULL OR
             qtcv.NGAY_THOI_CHUC_VU <= toYear))
        OR ((timeType = 3) AND
            (fromYear IS NULL OR fromYear = 0 OR qtcv.NGAY_RA_QD_THOI_CHUC_VU IS NULL OR
             qtcv.NGAY_RA_QD_THOI_CHUC_VU >= fromYear) AND
            (toYear IS NULL OR toYear = 0 OR qtcv.NGAY_RA_QD_THOI_CHUC_VU IS NULL OR
             qtcv.NGAY_RA_QD <= toYear))
        )
      AND (listChucVu IS NULL OR (listChucVu IS NOT NULL AND qtcv.MA_CHUC_VU IN
                                                             (SELECT regexp_substr(listChucVu, '[^,]+', 1, level)
                                                              from dual
                                                              connect by regexp_substr(listChucVu, '[^,]+', 1, level) is not null)))
      AND (listChucDanh IS NULL OR
           (listChucDanh IS NOT NULL AND
            CB.NGACH IN (SELECT regexp_substr(listChucDanh, '[^,]+', 1, level)
                         from dual
                         connect by regexp_substr(listChucDanh, '[^,]+', 1, level) is not null)))
      AND (fromAge IS NULL OR fromAge = 0 OR
           (SELECT TRUNC(MONTHS_BETWEEN(TRUNC(sysdate),
                                        (select to_date('19700101', 'YYYYMMDD') + (1 / 24 / 60 / 60 / 1000) * cb.NGAY_SINH
                                         from dual)) / 12)
            from dual) >= fromAge)
      AND (toAge IS NULL OR toAge = 0 OR
           (SELECT TRUNC(MONTHS_BETWEEN(TRUNC(sysdate),
                                        (select to_date('19700101', 'YYYYMMDD') + (1 / 24 / 60 / 60 / 1000) * cb.NGAY_SINH
                                         from dual)) / 12)
            from dual) <= toAge)
      AND (qtcv.THOI_CHUC_VU = 0)
      AND (searchTerm = ''
        OR LOWER(cb.SHCC) LIKE sT
        OR LOWER(TRIM(cb.HO || ' ' || cb.TEN)) LIKE sT
        OR LOWER(qtcv.SO_QD) LIKE sT
        OR LOWER(qtcv.SO_QD_THOI_CHUC_VU) LIKE sT
        OR LOWER(cv.TEN) LIKE sT
        OR LOWER(dv.TEN) LIKE sT)
    ORDER BY qtcv.MA_CHUC_VU DESC;

    pageTotal := CEIL(totalItem / pageSize);
    pageNumber := LEAST(pageNumber, pageTotal);
    IF pageNumber < 1 THEN pageNumber := 1; END IF;
    IF pageSize < 1 THEN pageSize := 1; END IF;

    OPEN my_cursor FOR
        SELECT *
        FROM (
                 SELECT qtcv.SHCC AS                                                    "shcc",
                        qtcv.STT  AS                                                    "stt",
                        cb.HO     AS                                                    "ho",
                        cb.TEN    AS                                                    "ten",

                        (SELECT COUNT(*)
                         FROM QT_CHUC_VU qtcv_temp
                                  LEFT JOIN TCHC_CAN_BO cb on qtcv_temp.SHCC = cb.SHCC
                                  LEFT JOIN DM_CHUC_VU cv ON qtcv_temp.MA_CHUC_VU = cv.MA
                                  LEFT JOIN DM_DON_VI dv ON qtcv_temp.MA_DON_VI = dv.MA
                                  LEFT JOIN DM_BO_MON bm ON qtcv_temp.MA_BO_MON = bm.MA
                                  LEFT JOIN DM_NGACH_CDNN cdnn on cb.NGACH = cdnn.MA
                         WHERE (qtcv_temp.SHCC = qtcv.SHCC)
                         AND ((listShcc IS NOT NULL AND
                                            qtcv_temp.SHCC IN (SELECT regexp_substr(listShcc, '[^,]+', 1, level)
                                                               from dual
                                                               connect by regexp_substr(listShcc, '[^,]+', 1, level) is not null))
                                        OR (listDonVi IS NOT NULL AND
                                            qtcv_temp.MA_DON_VI IN (SELECT regexp_substr(listDonVi, '[^,]+', 1, level)
                                                                    from dual
                                                                    connect by regexp_substr(listDonVi, '[^,]+', 1, level) is not null))
                                        OR (listShcc IS NULL AND listDonVi IS NULL))
                                      AND (gioiTinh IS NULL OR (cb.PHAI = gioiTinh))
                                      AND (timeType = 0 OR timeType IS NULL OR (timeType = 1 AND
                                                                                (fromYear IS NULL OR fromYear = 0 OR
                                                                                 qtcv_temp.NGAY_RA_QD IS NULL OR
                                                                                 qtcv_temp.NGAY_RA_QD >= fromYear) AND
                                                                                (toYear IS NULL OR toYear = 0 OR
                                                                                 qtcv_temp.NGAY_RA_QD IS NULL OR
                                                                                 qtcv_temp.NGAY_RA_QD <= toYear))
                                        OR ((timeType = 2) AND
                                            (fromYear IS NULL OR fromYear = 0 OR qtcv_temp.NGAY_THOI_CHUC_VU IS NULL OR
                                             qtcv_temp.NGAY_THOI_CHUC_VU >= fromYear) AND
                                            (toYear IS NULL OR toYear = 0 OR qtcv_temp.NGAY_THOI_CHUC_VU IS NULL OR
                                             qtcv_temp.NGAY_THOI_CHUC_VU <= toYear))
                                        OR ((timeType = 3) AND
                                            (fromYear IS NULL OR fromYear = 0 OR
                                             qtcv_temp.NGAY_RA_QD_THOI_CHUC_VU IS NULL OR
                                             qtcv_temp.NGAY_RA_QD_THOI_CHUC_VU >= fromYear) AND
                                            (toYear IS NULL OR toYear = 0 OR
                                             qtcv_temp.NGAY_RA_QD_THOI_CHUC_VU IS NULL OR
                                             qtcv_temp.NGAY_RA_QD <= toYear))
                                        )
                                      AND (listChucVu IS NULL OR (listChucVu IS NOT NULL AND qtcv_temp.MA_CHUC_VU IN
                                                                                             (SELECT regexp_substr(listChucVu, '[^,]+', 1, level)
                                                                                              from dual
                                                                                              connect by regexp_substr(listChucVu, '[^,]+', 1, level) is not null)))
                                      AND (listChucDanh IS NULL OR
                                           (listChucDanh IS NOT NULL AND
                                            CB.NGACH IN (SELECT regexp_substr(listChucDanh, '[^,]+', 1, level)
                                                         from dual
                                                         connect by regexp_substr(listChucDanh, '[^,]+', 1, level) is not null)))
                                      AND (fromAge IS NULL OR fromAge = 0 OR
                                           (SELECT TRUNC(MONTHS_BETWEEN(TRUNC(sysdate),
                                                                        (select to_date('19700101', 'YYYYMMDD') + (1 / 24 / 60 / 60 / 1000) * cb.NGAY_SINH
                                                                         from dual)) / 12)
                                            from dual) >= fromAge)
                                      AND (toAge IS NULL OR toAge = 0 OR
                                           (SELECT TRUNC(MONTHS_BETWEEN(TRUNC(sysdate),
                                                                        (select to_date('19700101', 'YYYYMMDD') + (1 / 24 / 60 / 60 / 1000) * cb.NGAY_SINH
                                                                         from dual)) / 12)
                                            from dual) <= toAge)
                                      AND (qtcv_temp.THOI_CHUC_VU = 0)
                                      AND (searchTerm = ''
                                        OR LOWER(cb.SHCC) LIKE sT
                                        OR LOWER(TRIM(cb.HO || ' ' || cb.TEN)) LIKE sT
                                        OR LOWER(qtcv_temp.SO_QD) LIKE sT
                                        OR LOWER(qtcv_temp.SO_QD_THOI_CHUC_VU) LIKE sT
                                        OR LOWER(cv.TEN) LIKE sT
                                        OR LOWER(dv.TEN) LIKE sT)
                           )         AS                                                    "soChucVu",

                        (select rtrim(xmlagg(xmlelement(e, cv.TEN || ' ', '??').extract('//text()') order by
                                             null).getclobval(), '??')
                         FROM QT_CHUC_VU qtcv_temp
                                  LEFT JOIN TCHC_CAN_BO cb on qtcv_temp.SHCC = cb.SHCC
                                  LEFT JOIN DM_CHUC_VU cv ON qtcv_temp.MA_CHUC_VU = cv.MA
                                  LEFT JOIN DM_DON_VI dv ON qtcv_temp.MA_DON_VI = dv.MA
                                  LEFT JOIN DM_BO_MON bm ON qtcv_temp.MA_BO_MON = bm.MA
                                  LEFT JOIN DM_NGACH_CDNN cdnn on cb.NGACH = cdnn.MA
                         WHERE (qtcv_temp.SHCC = qtcv.SHCC)
                         AND ((listShcc IS NOT NULL AND
                                            qtcv_temp.SHCC IN (SELECT regexp_substr(listShcc, '[^,]+', 1, level)
                                                               from dual
                                                               connect by regexp_substr(listShcc, '[^,]+', 1, level) is not null))
                                        OR (listDonVi IS NOT NULL AND
                                            qtcv_temp.MA_DON_VI IN (SELECT regexp_substr(listDonVi, '[^,]+', 1, level)
                                                                    from dual
                                                                    connect by regexp_substr(listDonVi, '[^,]+', 1, level) is not null))
                                        OR (listShcc IS NULL AND listDonVi IS NULL))
                                      AND (gioiTinh IS NULL OR (cb.PHAI = gioiTinh))
                                      AND (timeType = 0 OR timeType IS NULL OR (timeType = 1 AND
                                                                                (fromYear IS NULL OR fromYear = 0 OR
                                                                                 qtcv_temp.NGAY_RA_QD IS NULL OR
                                                                                 qtcv_temp.NGAY_RA_QD >= fromYear) AND
                                                                                (toYear IS NULL OR toYear = 0 OR
                                                                                 qtcv_temp.NGAY_RA_QD IS NULL OR
                                                                                 qtcv_temp.NGAY_RA_QD <= toYear))
                                        OR ((timeType = 2) AND
                                            (fromYear IS NULL OR fromYear = 0 OR qtcv_temp.NGAY_THOI_CHUC_VU IS NULL OR
                                             qtcv_temp.NGAY_THOI_CHUC_VU >= fromYear) AND
                                            (toYear IS NULL OR toYear = 0 OR qtcv_temp.NGAY_THOI_CHUC_VU IS NULL OR
                                             qtcv_temp.NGAY_THOI_CHUC_VU <= toYear))
                                        OR ((timeType = 3) AND
                                            (fromYear IS NULL OR fromYear = 0 OR
                                             qtcv_temp.NGAY_RA_QD_THOI_CHUC_VU IS NULL OR
                                             qtcv_temp.NGAY_RA_QD_THOI_CHUC_VU >= fromYear) AND
                                            (toYear IS NULL OR toYear = 0 OR
                                             qtcv_temp.NGAY_RA_QD_THOI_CHUC_VU IS NULL OR
                                             qtcv_temp.NGAY_RA_QD <= toYear))
                                        )
                                      AND (listChucVu IS NULL OR (listChucVu IS NOT NULL AND qtcv_temp.MA_CHUC_VU IN
                                                                                             (SELECT regexp_substr(listChucVu, '[^,]+', 1, level)
                                                                                              from dual
                                                                                              connect by regexp_substr(listChucVu, '[^,]+', 1, level) is not null)))
                                      AND (listChucDanh IS NULL OR
                                           (listChucDanh IS NOT NULL AND
                                            CB.NGACH IN (SELECT regexp_substr(listChucDanh, '[^,]+', 1, level)
                                                         from dual
                                                         connect by regexp_substr(listChucDanh, '[^,]+', 1, level) is not null)))
                                      AND (fromAge IS NULL OR fromAge = 0 OR
                                           (SELECT TRUNC(MONTHS_BETWEEN(TRUNC(sysdate),
                                                                        (select to_date('19700101', 'YYYYMMDD') + (1 / 24 / 60 / 60 / 1000) * cb.NGAY_SINH
                                                                         from dual)) / 12)
                                            from dual) >= fromAge)
                                      AND (toAge IS NULL OR toAge = 0 OR
                                           (SELECT TRUNC(MONTHS_BETWEEN(TRUNC(sysdate),
                                                                        (select to_date('19700101', 'YYYYMMDD') + (1 / 24 / 60 / 60 / 1000) * cb.NGAY_SINH
                                                                         from dual)) / 12)
                                            from dual) <= toAge)
                                      AND (qtcv_temp.THOI_CHUC_VU = 0)
                                      AND (searchTerm = ''
                                        OR LOWER(cb.SHCC) LIKE sT
                                        OR LOWER(TRIM(cb.HO || ' ' || cb.TEN)) LIKE sT
                                        OR LOWER(qtcv_temp.SO_QD) LIKE sT
                                        OR LOWER(qtcv_temp.SO_QD_THOI_CHUC_VU) LIKE sT
                                        OR LOWER(cv.TEN) LIKE sT
                                        OR LOWER(dv.TEN) LIKE sT)
                        )         AS                                                    "danhSachChucVu",

                        (select rtrim(xmlagg(xmlelement(e, bm.TEN || ' ', '??').extract('//text()') order by
                                             null).getclobval(), '??')
                         FROM QT_CHUC_VU qtcv_temp
                                  LEFT JOIN TCHC_CAN_BO cb on qtcv_temp.SHCC = cb.SHCC
                                  LEFT JOIN DM_CHUC_VU cv ON qtcv_temp.MA_CHUC_VU = cv.MA
                                  LEFT JOIN DM_DON_VI dv ON qtcv_temp.MA_DON_VI = dv.MA
                                  LEFT JOIN DM_BO_MON bm ON qtcv_temp.MA_BO_MON = bm.MA
                                  LEFT JOIN DM_NGACH_CDNN cdnn on cb.NGACH = cdnn.MA
                         WHERE (qtcv_temp.SHCC = qtcv.SHCC)
                         AND ((listShcc IS NOT NULL AND
                                            qtcv_temp.SHCC IN (SELECT regexp_substr(listShcc, '[^,]+', 1, level)
                                                               from dual
                                                               connect by regexp_substr(listShcc, '[^,]+', 1, level) is not null))
                                        OR (listDonVi IS NOT NULL AND
                                            qtcv_temp.MA_DON_VI IN (SELECT regexp_substr(listDonVi, '[^,]+', 1, level)
                                                                    from dual
                                                                    connect by regexp_substr(listDonVi, '[^,]+', 1, level) is not null))
                                        OR (listShcc IS NULL AND listDonVi IS NULL))
                                      AND (gioiTinh IS NULL OR (cb.PHAI = gioiTinh))
                                      AND (timeType = 0 OR timeType IS NULL OR (timeType = 1 AND
                                                                                (fromYear IS NULL OR fromYear = 0 OR
                                                                                 qtcv_temp.NGAY_RA_QD IS NULL OR
                                                                                 qtcv_temp.NGAY_RA_QD >= fromYear) AND
                                                                                (toYear IS NULL OR toYear = 0 OR
                                                                                 qtcv_temp.NGAY_RA_QD IS NULL OR
                                                                                 qtcv_temp.NGAY_RA_QD <= toYear))
                                        OR ((timeType = 2) AND
                                            (fromYear IS NULL OR fromYear = 0 OR qtcv_temp.NGAY_THOI_CHUC_VU IS NULL OR
                                             qtcv_temp.NGAY_THOI_CHUC_VU >= fromYear) AND
                                            (toYear IS NULL OR toYear = 0 OR qtcv_temp.NGAY_THOI_CHUC_VU IS NULL OR
                                             qtcv_temp.NGAY_THOI_CHUC_VU <= toYear))
                                        OR ((timeType = 3) AND
                                            (fromYear IS NULL OR fromYear = 0 OR
                                             qtcv_temp.NGAY_RA_QD_THOI_CHUC_VU IS NULL OR
                                             qtcv_temp.NGAY_RA_QD_THOI_CHUC_VU >= fromYear) AND
                                            (toYear IS NULL OR toYear = 0 OR
                                             qtcv_temp.NGAY_RA_QD_THOI_CHUC_VU IS NULL OR
                                             qtcv_temp.NGAY_RA_QD <= toYear))
                                        )
                                      AND (listChucVu IS NULL OR (listChucVu IS NOT NULL AND qtcv_temp.MA_CHUC_VU IN
                                                                                             (SELECT regexp_substr(listChucVu, '[^,]+', 1, level)
                                                                                              from dual
                                                                                              connect by regexp_substr(listChucVu, '[^,]+', 1, level) is not null)))
                                      AND (listChucDanh IS NULL OR
                                           (listChucDanh IS NOT NULL AND
                                            CB.NGACH IN (SELECT regexp_substr(listChucDanh, '[^,]+', 1, level)
                                                         from dual
                                                         connect by regexp_substr(listChucDanh, '[^,]+', 1, level) is not null)))
                                      AND (fromAge IS NULL OR fromAge = 0 OR
                                           (SELECT TRUNC(MONTHS_BETWEEN(TRUNC(sysdate),
                                                                        (select to_date('19700101', 'YYYYMMDD') + (1 / 24 / 60 / 60 / 1000) * cb.NGAY_SINH
                                                                         from dual)) / 12)
                                            from dual) >= fromAge)
                                      AND (toAge IS NULL OR toAge = 0 OR
                                           (SELECT TRUNC(MONTHS_BETWEEN(TRUNC(sysdate),
                                                                        (select to_date('19700101', 'YYYYMMDD') + (1 / 24 / 60 / 60 / 1000) * cb.NGAY_SINH
                                                                         from dual)) / 12)
                                            from dual) <= toAge)
                                      AND (qtcv_temp.THOI_CHUC_VU = 0)
                                      AND (searchTerm = ''
                                        OR LOWER(cb.SHCC) LIKE sT
                                        OR LOWER(TRIM(cb.HO || ' ' || cb.TEN)) LIKE sT
                                        OR LOWER(qtcv_temp.SO_QD) LIKE sT
                                        OR LOWER(qtcv_temp.SO_QD_THOI_CHUC_VU) LIKE sT
                                        OR LOWER(cv.TEN) LIKE sT
                                        OR LOWER(dv.TEN) LIKE sT)
                        )         AS                                                    "danhSachBoMon",

                        (select rtrim(xmlagg(xmlelement(e, dv.TEN || ' ', '??').extract('//text()') order by
                                             null).getclobval(), '??')
                         FROM QT_CHUC_VU qtcv_temp
                                  LEFT JOIN TCHC_CAN_BO cb on qtcv_temp.SHCC = cb.SHCC
                                  LEFT JOIN DM_CHUC_VU cv ON qtcv_temp.MA_CHUC_VU = cv.MA
                                  LEFT JOIN DM_DON_VI dv ON qtcv_temp.MA_DON_VI = dv.MA
                                  LEFT JOIN DM_BO_MON bm ON qtcv_temp.MA_BO_MON = bm.MA
                                  LEFT JOIN DM_NGACH_CDNN cdnn on cb.NGACH = cdnn.MA
                         WHERE (qtcv_temp.SHCC = qtcv.SHCC)
                         AND ((listShcc IS NOT NULL AND
                                            qtcv_temp.SHCC IN (SELECT regexp_substr(listShcc, '[^,]+', 1, level)
                                                               from dual
                                                               connect by regexp_substr(listShcc, '[^,]+', 1, level) is not null))
                                        OR (listDonVi IS NOT NULL AND
                                            qtcv_temp.MA_DON_VI IN (SELECT regexp_substr(listDonVi, '[^,]+', 1, level)
                                                                    from dual
                                                                    connect by regexp_substr(listDonVi, '[^,]+', 1, level) is not null))
                                        OR (listShcc IS NULL AND listDonVi IS NULL))
                                      AND (gioiTinh IS NULL OR (cb.PHAI = gioiTinh))
                                      AND (timeType = 0 OR timeType IS NULL OR (timeType = 1 AND
                                                                                (fromYear IS NULL OR fromYear = 0 OR
                                                                                 qtcv_temp.NGAY_RA_QD IS NULL OR
                                                                                 qtcv_temp.NGAY_RA_QD >= fromYear) AND
                                                                                (toYear IS NULL OR toYear = 0 OR
                                                                                 qtcv_temp.NGAY_RA_QD IS NULL OR
                                                                                 qtcv_temp.NGAY_RA_QD <= toYear))
                                        OR ((timeType = 2) AND
                                            (fromYear IS NULL OR fromYear = 0 OR qtcv_temp.NGAY_THOI_CHUC_VU IS NULL OR
                                             qtcv_temp.NGAY_THOI_CHUC_VU >= fromYear) AND
                                            (toYear IS NULL OR toYear = 0 OR qtcv_temp.NGAY_THOI_CHUC_VU IS NULL OR
                                             qtcv_temp.NGAY_THOI_CHUC_VU <= toYear))
                                        OR ((timeType = 3) AND
                                            (fromYear IS NULL OR fromYear = 0 OR
                                             qtcv_temp.NGAY_RA_QD_THOI_CHUC_VU IS NULL OR
                                             qtcv_temp.NGAY_RA_QD_THOI_CHUC_VU >= fromYear) AND
                                            (toYear IS NULL OR toYear = 0 OR
                                             qtcv_temp.NGAY_RA_QD_THOI_CHUC_VU IS NULL OR
                                             qtcv_temp.NGAY_RA_QD <= toYear))
                                        )
                                      AND (listChucVu IS NULL OR (listChucVu IS NOT NULL AND qtcv_temp.MA_CHUC_VU IN
                                                                                             (SELECT regexp_substr(listChucVu, '[^,]+', 1, level)
                                                                                              from dual
                                                                                              connect by regexp_substr(listChucVu, '[^,]+', 1, level) is not null)))
                                      AND (listChucDanh IS NULL OR
                                           (listChucDanh IS NOT NULL AND
                                            CB.NGACH IN (SELECT regexp_substr(listChucDanh, '[^,]+', 1, level)
                                                         from dual
                                                         connect by regexp_substr(listChucDanh, '[^,]+', 1, level) is not null)))
                                      AND (fromAge IS NULL OR fromAge = 0 OR
                                           (SELECT TRUNC(MONTHS_BETWEEN(TRUNC(sysdate),
                                                                        (select to_date('19700101', 'YYYYMMDD') + (1 / 24 / 60 / 60 / 1000) * cb.NGAY_SINH
                                                                         from dual)) / 12)
                                            from dual) >= fromAge)
                                      AND (toAge IS NULL OR toAge = 0 OR
                                           (SELECT TRUNC(MONTHS_BETWEEN(TRUNC(sysdate),
                                                                        (select to_date('19700101', 'YYYYMMDD') + (1 / 24 / 60 / 60 / 1000) * cb.NGAY_SINH
                                                                         from dual)) / 12)
                                            from dual) <= toAge)
                                      AND (qtcv_temp.THOI_CHUC_VU = 0)
                                      AND (searchTerm = ''
                                        OR LOWER(cb.SHCC) LIKE sT
                                        OR LOWER(TRIM(cb.HO || ' ' || cb.TEN)) LIKE sT
                                        OR LOWER(qtcv_temp.SO_QD) LIKE sT
                                        OR LOWER(qtcv_temp.SO_QD_THOI_CHUC_VU) LIKE sT
                                        OR LOWER(cv.TEN) LIKE sT
                                        OR LOWER(dv.TEN) LIKE sT)
                        )         AS                                                    "danhSachDonVi",

                        ROW_NUMBER() OVER (ORDER BY qtcv.NGAY_RA_QD_THOI_CHUC_VU DESC ) R
                 FROM (SELECT * FROM QT_CHUC_VU WHERE STT IN (SELECT MAX(STT) FROM QT_CHUC_VU qtcv_temp
                                             LEFT JOIN TCHC_CAN_BO cb on qtcv_temp.SHCC = cb.SHCC
                                             LEFT JOIN DM_CHUC_VU cv ON qtcv_temp.MA_CHUC_VU = cv.MA
                                             LEFT JOIN DM_DON_VI dv ON qtcv_temp.MA_DON_VI = dv.MA
                                             LEFT JOIN DM_BO_MON bm ON qtcv_temp.MA_BO_MON = bm.MA
                                             LEFT JOIN DM_NGACH_CDNN cdnn on cb.NGACH = cdnn.MA
                                    WHERE ((listShcc IS NOT NULL AND
                                            qtcv_temp.SHCC IN (SELECT regexp_substr(listShcc, '[^,]+', 1, level)
                                                               from dual
                                                               connect by regexp_substr(listShcc, '[^,]+', 1, level) is not null))
                                        OR (listDonVi IS NOT NULL AND
                                            qtcv_temp.MA_DON_VI IN (SELECT regexp_substr(listDonVi, '[^,]+', 1, level)
                                                                    from dual
                                                                    connect by regexp_substr(listDonVi, '[^,]+', 1, level) is not null))
                                        OR (listShcc IS NULL AND listDonVi IS NULL))
                                      AND (gioiTinh IS NULL OR (cb.PHAI = gioiTinh))
                                      AND (timeType = 0 OR timeType IS NULL OR (timeType = 1 AND
                                                                                (fromYear IS NULL OR fromYear = 0 OR
                                                                                 qtcv_temp.NGAY_RA_QD IS NULL OR
                                                                                 qtcv_temp.NGAY_RA_QD >= fromYear) AND
                                                                                (toYear IS NULL OR toYear = 0 OR
                                                                                 qtcv_temp.NGAY_RA_QD IS NULL OR
                                                                                 qtcv_temp.NGAY_RA_QD <= toYear))
                                        OR ((timeType = 2) AND
                                            (fromYear IS NULL OR fromYear = 0 OR qtcv_temp.NGAY_THOI_CHUC_VU IS NULL OR
                                             qtcv_temp.NGAY_THOI_CHUC_VU >= fromYear) AND
                                            (toYear IS NULL OR toYear = 0 OR qtcv_temp.NGAY_THOI_CHUC_VU IS NULL OR
                                             qtcv_temp.NGAY_THOI_CHUC_VU <= toYear))
                                        OR ((timeType = 3) AND
                                            (fromYear IS NULL OR fromYear = 0 OR
                                             qtcv_temp.NGAY_RA_QD_THOI_CHUC_VU IS NULL OR
                                             qtcv_temp.NGAY_RA_QD_THOI_CHUC_VU >= fromYear) AND
                                            (toYear IS NULL OR toYear = 0 OR
                                             qtcv_temp.NGAY_RA_QD_THOI_CHUC_VU IS NULL OR
                                             qtcv_temp.NGAY_RA_QD <= toYear))
                                        )
                                      AND (listChucVu IS NULL OR (listChucVu IS NOT NULL AND qtcv_temp.MA_CHUC_VU IN
                                                                                             (SELECT regexp_substr(listChucVu, '[^,]+', 1, level)
                                                                                              from dual
                                                                                              connect by regexp_substr(listChucVu, '[^,]+', 1, level) is not null)))
                                      AND (listChucDanh IS NULL OR
                                           (listChucDanh IS NOT NULL AND
                                            CB.NGACH IN (SELECT regexp_substr(listChucDanh, '[^,]+', 1, level)
                                                         from dual
                                                         connect by regexp_substr(listChucDanh, '[^,]+', 1, level) is not null)))
                                      AND (fromAge IS NULL OR fromAge = 0 OR
                                           (SELECT TRUNC(MONTHS_BETWEEN(TRUNC(sysdate),
                                                                        (select to_date('19700101', 'YYYYMMDD') + (1 / 24 / 60 / 60 / 1000) * cb.NGAY_SINH
                                                                         from dual)) / 12)
                                            from dual) >= fromAge)
                                      AND (toAge IS NULL OR toAge = 0 OR
                                           (SELECT TRUNC(MONTHS_BETWEEN(TRUNC(sysdate),
                                                                        (select to_date('19700101', 'YYYYMMDD') + (1 / 24 / 60 / 60 / 1000) * cb.NGAY_SINH
                                                                         from dual)) / 12)
                                            from dual) <= toAge)
                                      AND (qtcv_temp.THOI_CHUC_VU = 0)
                                      AND (searchTerm = ''
                                        OR LOWER(cb.SHCC) LIKE sT
                                        OR LOWER(TRIM(cb.HO || ' ' || cb.TEN)) LIKE sT
                                        OR LOWER(qtcv_temp.SO_QD) LIKE sT
                                        OR LOWER(qtcv_temp.SO_QD_THOI_CHUC_VU) LIKE sT
                                        OR LOWER(cv.TEN) LIKE sT
                                        OR LOWER(dv.TEN) LIKE sT) GROUP BY qtcv_temp.SHCC)) qtcv
                          LEFT JOIN TCHC_CAN_BO cb
                                    on qtcv.SHCC = cb.SHCC
                 ORDER BY qtcv.MA_CHUC_VU
             )
        WHERE R BETWEEN (pageNumber - 1) * pageSize + 1 AND pageNumber * pageSize;
    RETURN my_cursor;
END;

/
--EndMethod--

CREATE OR REPLACE FUNCTION QT_CHUC_VU_SEARCH_PAGE(pageNumber IN OUT NUMBER, pageSize IN OUT NUMBER,
                                       filter IN STRING, searchTerm IN STRING,
                                       totalItem OUT NUMBER, pageTotal OUT NUMBER) RETURN SYS_REFCURSOR
AS
    my_cursor    SYS_REFCURSOR;
    sT           STRING(500) := '%' || lower(searchTerm) || '%';
    listShcc     STRING(255);
    listDonVi    STRING(255);
    fromYear     NUMBER(20);
    toYear       NUMBER(20);
    timeType     NUMBER(20);
    listChucVu   STRING(255);
    listChucDanh STRING(255);
    gioiTinh     STRING(255);
    fromAge      NUMBER(20);
    toAge        NUMBER(20);
BEGIN
    SELECT JSON_VALUE(filter, '$.listShcc') INTO listShcc FROM DUAL;
    SELECT JSON_VALUE(filter, '$.listDonVi') INTO listDonVi FROM DUAL;
    SELECT JSON_VALUE(filter, '$.fromYear' RETURNING NUMBER) INTO fromYear FROM DUAL;
    SELECT JSON_VALUE(filter, '$.toYear' RETURNING NUMBER) INTO toYear FROM DUAL;
    SELECT JSON_VALUE(filter, '$.timeType' RETURNING NUMBER) INTO timeType FROM DUAL;
    SELECT JSON_VALUE(filter, '$.listChucVu') INTO listChucVu FROM DUAL;
    SELECT JSON_VALUE(filter, '$.listChucDanh') INTO listChucDanh FROM DUAL;
    SELECT JSON_VALUE(filter, '$.gioiTinh') INTO gioiTinh FROM DUAL;
    SELECT JSON_VALUE(filter, '$.fromAge' RETURNING NUMBER) INTO fromAge FROM DUAL;
    SELECT JSON_VALUE(filter, '$.toAge' RETURNING NUMBER) INTO toAge FROM DUAL;

    SELECT COUNT(*)
    INTO totalItem

    FROM QT_CHUC_VU qtcv
             LEFT JOIN TCHC_CAN_BO cb on qtcv.SHCC = cb.SHCC
             LEFT JOIN DM_CHUC_VU cv ON qtcv.MA_CHUC_VU = cv.MA
             LEFT JOIN DM_DON_VI dv ON qtcv.MA_DON_VI = dv.MA
             LEFT JOIN DM_BO_MON bm ON qtcv.MA_BO_MON = bm.MA
             LEFT JOIN DM_NGACH_CDNN cdnn on cb.NGACH = cdnn.MA
    WHERE ((listShcc IS NOT NULL AND qtcv.SHCC IN (SELECT regexp_substr(listShcc, '[^,]+', 1, level)
                                                   from dual
                                                   connect by regexp_substr(listShcc, '[^,]+', 1, level) is not null))
        OR (listDonVi IS NOT NULL AND qtcv.MA_DON_VI IN (SELECT regexp_substr(listDonVi, '[^,]+', 1, level)
                                                         from dual
                                                         connect by regexp_substr(listDonVi, '[^,]+', 1, level) is not null))
        OR (listShcc IS NULL AND listDonVi IS NULL))
      AND (gioiTinh IS NULL OR (cb.PHAI = gioiTinh))
      AND (timeType = 0 OR timeType IS NULL OR (timeType = 1 AND
                            (fromYear IS NULL OR fromYear = 0 OR qtcv.NGAY_RA_QD IS NULL OR qtcv.NGAY_RA_QD >= fromYear) AND
                            (toYear IS NULL OR toYear = 0 OR qtcv.NGAY_RA_QD IS NULL OR qtcv.NGAY_RA_QD <= toYear))
        OR ((timeType = 2) AND
            (fromYear IS NULL OR fromYear = 0 OR qtcv.NGAY_THOI_CHUC_VU IS NULL OR qtcv.NGAY_THOI_CHUC_VU >= fromYear) AND
            (toYear IS NULL OR toYear = 0 OR qtcv.NGAY_THOI_CHUC_VU IS NULL OR qtcv.NGAY_THOI_CHUC_VU <= toYear))
        OR ((timeType = 3) AND
            (fromYear IS NULL OR fromYear = 0 OR qtcv.NGAY_RA_QD_THOI_CHUC_VU IS NULL OR qtcv.NGAY_RA_QD_THOI_CHUC_VU >= fromYear) AND
            (toYear IS NULL OR toYear = 0 OR qtcv.NGAY_RA_QD_THOI_CHUC_VU IS NULL OR qtcv.NGAY_RA_QD <= toYear))
        )
      AND (listChucVu IS NULL OR
           (listChucVu IS NOT NULL AND qtcv.MA_CHUC_VU IN (SELECT regexp_substr(listChucVu, '[^,]+', 1, level)
                                                           from dual
                                                           connect by regexp_substr(listChucVu, '[^,]+', 1, level) is not null)))
      AND (listChucDanh IS NULL OR
           (listChucDanh IS NOT NULL AND CB.NGACH IN (SELECT regexp_substr(listChucDanh, '[^,]+', 1, level)
                                                      from dual
                                                      connect by regexp_substr(listChucDanh, '[^,]+', 1, level) is not null)))
      AND (fromAge = 0 OR fromAge IS NULL OR
           (cb.NGAY_SINH IS NOT NULL AND (SELECT TRUNC(MONTHS_BETWEEN(TRUNC(sysdate),
                                                                      (select to_date('19700101', 'YYYYMMDD') + (1 / 24 / 60 / 60 / 1000) * cb.NGAY_SINH
                                                                       from dual)) / 12)
                                          from dual) >= fromAge))
      AND (toAge = 0 OR toAge IS NULL OR
           (cb.NGAY_SINH IS NOT NULL AND (SELECT TRUNC(MONTHS_BETWEEN(TRUNC(sysdate),
                                                                      (select to_date('19700101', 'YYYYMMDD') + (1 / 24 / 60 / 60 / 1000) * cb.NGAY_SINH
                                                                       from dual)) / 12)
                                          from dual) <= toAge))
      AND (qtcv.THOI_CHUC_VU = 0)
      AND (searchTerm = ''
        OR LOWER(cb.SHCC) LIKE sT
        OR LOWER(TRIM(cb.HO || ' ' || cb.TEN)) LIKE sT
        OR LOWER(qtcv.SO_QD) LIKE sT
        OR LOWER(qtcv.SO_QD_THOI_CHUC_VU) LIKE sT
        OR LOWER(cv.TEN) LIKE sT
        OR LOWER(dv.TEN) LIKE sT);

    IF pageNumber < 1 THEN pageNumber := 1; END IF;
    IF pageSize < 1 THEN pageSize := 1; END IF;
    pageTotal := CEIL(totalItem / pageSize);
    pageNumber := LEAST(pageNumber, pageTotal);

    OPEN my_cursor FOR
        SELECT *
        FROM (
                 SELECT qtcv.SHCC                    AS        "shcc",
                        qtcv.STT                     AS        "stt",
                        cb.HO                        AS        "ho",
                        cb.TEN                       AS        "ten",
                        cb.NGAY_SINH                 AS        "ngaySinh",
                        cv.PHU_CAP                   AS        "phuCap",
                        qtcv.MA_DON_VI               AS        "maDonVi",
                        dv.TEN                       AS        "tenDonVi",
                        qtcv.MA_BO_MON               AS        "maBoMon",
                        bm.TEN                       AS        "tenBoMon",
                        qtcv.MA_CHUC_VU              AS        "maChucVu",
                        cv.TEN                       AS        "tenChucVu",
                        qtcv.SO_QD                   AS        "soQuyetDinh",
                        qtcv.NGAY_RA_QD              AS        "ngayRaQuyetDinh",
                        qtcv.CHUC_VU_CHINH           AS        "chucVuChinh",
                        qtcv.THOI_CHUC_VU            AS        "thoiChucVu",
                        qtcv.SO_QD_THOI_CHUC_VU      AS        "soQdThoiChucVu",
                        qtcv.NGAY_THOI_CHUC_VU       AS        "ngayThoiChucVu",
                        qtcv.NGAY_RA_QD_THOI_CHUC_VU AS        "ngayRaQdThoiChucVu",
                        cv.IS_CAP_TRUONG             AS        "capChucVu",
                        cdnn.TEN                     AS        "chucDanhNgheNghiep",
                        (SELECT TRUNC(MONTHS_BETWEEN(TRUNC(sysdate),
                                                     (select to_date('19700101', 'YYYYMMDD') + (1 / 24 / 60 / 60 / 1000) * cb.NGAY_SINH
                                                      from dual)) / 12)
                         from dual)                  AS        tuoiCanBo,
                        ROW_NUMBER() OVER (ORDER BY qtcv.SHCC) R
                 FROM QT_CHUC_VU qtcv
                          LEFT JOIN TCHC_CAN_BO cb on qtcv.SHCC = cb.SHCC
                          LEFT JOIN DM_CHUC_VU cv ON qtcv.MA_CHUC_VU = cv.MA
                          LEFT JOIN DM_DON_VI dv ON qtcv.MA_DON_VI = dv.MA
                          LEFT JOIN DM_BO_MON bm ON qtcv.MA_BO_MON = bm.MA
                          LEFT JOIN DM_NGACH_CDNN cdnn on cb.NGACH = cdnn.MA
                 WHERE ((listShcc IS NOT NULL AND qtcv.SHCC IN (SELECT regexp_substr(listShcc, '[^,]+', 1, level)
                                                                from dual
                                                                connect by regexp_substr(listShcc, '[^,]+', 1, level) is not null))
                     OR (listDonVi IS NOT NULL AND qtcv.MA_DON_VI IN (SELECT regexp_substr(listDonVi, '[^,]+', 1, level)
                                                                      from dual
                                                                      connect by regexp_substr(listDonVi, '[^,]+', 1, level) is not null))
                     OR (listShcc IS NULL AND listDonVi IS NULL))
                   AND (gioiTinh IS NULL OR (cb.PHAI = gioiTinh))
                   AND (timeType = 0 OR timeType IS NULL OR (timeType = 1 AND
                                         (fromYear IS NULL OR fromYear = 0 OR qtcv.NGAY_RA_QD IS NULL OR
                                          qtcv.NGAY_RA_QD >= fromYear) AND
                                         (toYear IS NULL OR toYear = 0 OR qtcv.NGAY_RA_QD IS NULL OR qtcv.NGAY_RA_QD <= toYear))
                     OR ((timeType = 2) AND
                         (fromYear IS NULL OR fromYear = 0 OR qtcv.NGAY_THOI_CHUC_VU IS NULL OR qtcv.NGAY_THOI_CHUC_VU >= fromYear) AND
                         (toYear IS NULL OR toYear = 0 OR qtcv.NGAY_THOI_CHUC_VU IS NULL OR qtcv.NGAY_THOI_CHUC_VU <= toYear))
                     OR ((timeType = 3) AND
                         (fromYear IS NULL OR fromYear = 0 OR qtcv.NGAY_RA_QD_THOI_CHUC_VU IS NULL OR
                          qtcv.NGAY_RA_QD_THOI_CHUC_VU >= fromYear) AND
                         (toYear IS NULL OR toYear = 0 OR qtcv.NGAY_RA_QD_THOI_CHUC_VU IS NULL OR qtcv.NGAY_RA_QD <= toYear))
                     )
                   AND (listChucVu IS NULL OR
                        (listChucVu IS NOT NULL AND
                         qtcv.MA_CHUC_VU IN (SELECT regexp_substr(listChucVu, '[^,]+', 1, level)
                                             from dual
                                             connect by regexp_substr(listChucVu, '[^,]+', 1, level) is not null)))
                   AND (listChucDanh IS NULL OR
                        (listChucDanh IS NOT NULL AND CB.NGACH IN (SELECT regexp_substr(listChucDanh, '[^,]+', 1, level)
                                                                   from dual
                                                                   connect by regexp_substr(listChucDanh, '[^,]+', 1, level) is not null)))
                   AND (fromAge IS NULL OR fromAge = 0 OR
                        (cb.NGAY_SINH IS NOT NULL AND (SELECT TRUNC(MONTHS_BETWEEN(TRUNC(sysdate),
                                                                                   (select to_date('19700101', 'YYYYMMDD') + (1 / 24 / 60 / 60 / 1000) * cb.NGAY_SINH
                                                                                    from dual)) / 12)
                                                       from dual) >= fromAge))
                   AND (toAge IS NULL OR toAge = 0 OR
                        (cb.NGAY_SINH IS NOT NULL AND (SELECT TRUNC(MONTHS_BETWEEN(TRUNC(sysdate),
                                                                                   (select to_date('19700101', 'YYYYMMDD') + (1 / 24 / 60 / 60 / 1000) * cb.NGAY_SINH
                                                                                    from dual)) / 12)
                                                       from dual) <= toAge))
                   AND (qtcv.THOI_CHUC_VU = 0)
                   AND (searchTerm = ''
                     OR LOWER(cb.SHCC) LIKE sT
                     OR LOWER(TRIM(cb.HO || ' ' || cb.TEN)) LIKE sT
                     OR LOWER(qtcv.SO_QD) LIKE sT
                     OR LOWER(qtcv.SO_QD_THOI_CHUC_VU) LIKE sT
                     OR LOWER(cv.TEN) LIKE sT
                     OR LOWER(dv.TEN) LIKE sT)
                 ORDER BY QTCV.SHCC, QTCV.MA_CHUC_VU
             )
        WHERE R BETWEEN (pageNumber - 1) * pageSize + 1 AND pageNumber * pageSize;
    RETURN my_cursor;
END;

/
--EndMethod--

CREATE OR REPLACE FUNCTION QT_CONG_TAC_TRONG_NUOC_DOWNLOAD_EXCEL(list_shcc IN STRING, list_dv IN STRING,
                                          fromYear IN NUMBER, toYear IN NUMBER, timeType IN NUMBER, tinhTrang IN NUMBER,
                                          loaiHocVi IN STRING, mucDich IN STRING) RETURN SYS_REFCURSOR
AS
    my_cursor SYS_REFCURSOR;
    today     NUMBER(20);
BEGIN
    select (cast(sysdate as date) - cast(to_date('1970-01-01', 'YYYY-MM-DD') as date)) * 86400000 into today from dual;
    OPEN my_cursor FOR
        SELECT *
        FROM (
                 SELECT qtcttn.ID               AS                  "id",
                        qtcttn.LY_DO         AS                  "lyDo",
                        qtcttn.NOI_DEN         AS                  "noiDen",
                        qtcttn.SHCC             AS                  "shcc",
                        qtcttn.VIET_TAT  AS "vietTat",
                        qtcttn.BAT_DAU   AS "batDau",
                        qtcttn.BAT_DAU_TYPE  AS "batDauType",
                        qtcttn.KET_THUC   AS "ketThuc",
                        qtcttn.KET_THUC_TYPE  AS "ketThucType",
                        qtcttn.KINH_PHI   AS "kinhPhi",
                        qtcttn.GHI_CHU   AS "ghiChu",
                        qtcttn.SO_CV AS "soCv",
                        qtcttn.NGAY_QUYET_DINH   AS "ngayQuyetDinh",

                        (select rtrim(xmlagg(xmlelement(e, dmttp.TEN, ', ').extract('//text()') order by null).getclobval(), ', ')
                         FROM DM_TINH_THANH_PHO dmttp
                         WHERE INSTR(qtcttn.NOI_DEN, dmttp.MA) != 0
                        ) AS "danhSachTinh",

                        today                 AS                  "today",
                        cb.HO                 AS                  "hoCanBo",
                        cb.TEN                AS                  "tenCanBo",
                        dmtd.TEN              AS                  "tenHocVi",
                        dv.MA                 AS                  "maDonVi",
                        dv.TEN                AS                  "tenDonVi",
                        DMDTN.MO_TA           AS    "tenMucDich",
                        dmcv.TEN    AS "tenChucVu",

                        ROW_NUMBER() OVER (ORDER BY BAT_DAU DESC) R
                FROM QT_CONG_TAC_TRONG_NUOC qtcttn
                         LEFT JOIN TCHC_CAN_BO cb on qtcttn.SHCC = cb.SHCC
                         LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
                         LEFT JOIN DM_MUC_DICH_TRONG_NUOC DMDTN on qtcttn.VIET_TAT = DMDTN.MA
                         LEFT JOIN DM_TRINH_DO dmtd ON cb.HOC_VI = dmtd.MA
                         LEFT JOIN DM_CHUC_VU dmcv ON dmcv.MA = cb.MA_CHUC_VU
                WHERE (((list_shcc IS NULL) AND (list_dv IS NULL) AND (fromYear IS NULL) AND (toYear IS NULL) AND
                         (timeType IS NULL) AND (tinhTrang IS NULL) AND (loaiHocVi IS NULL) AND (mucDich IS NULL))
                     OR (((list_shcc IS NOT NULL AND cb.SHCC IN (SELECT regexp_substr(list_shcc, '[^,]+', 1, level)
                                                                 from dual
                                                                 connect by regexp_substr(list_shcc, '[^,]+', 1, level) is not null))
                         OR (list_dv IS NOT NULL AND cb.MA_DON_VI IN (SELECT regexp_substr(list_dv, '[^,]+', 1, level)
                                                                      from dual
                                                                      connect by regexp_substr(list_dv, '[^,]+', 1, level) is not null))
                         OR (list_shcc IS NULL AND list_dv IS NULL))
                         AND (loaiHocVi IS NULL OR INSTR(loaiHocVi, cb.HOC_VI) != 0)
                         AND (mucDich IS NULL OR INSTR(mucDich, qtcttn.VIET_TAT) != 0)
                         AND (timeType IS NULL OR (
                                     timeType = 0 AND
                                     (qtcttn.BAT_DAU IS NOT NULL AND
                                      (fromYear IS NULL OR qtcttn.BAT_DAU >= fromYear)) AND
                                     (toYear IS NULL OR qtcttn.BAT_DAU <= toYear)
                             ) OR (
                                          timeType = 1 AND
                                          (qtcttn.KET_THUC IS NOT NULL AND
                                           (fromYear IS NULL OR qtcttn.KET_THUC >= fromYear)) AND
                                          (toYear IS NULL OR qtcttn.KET_THUC <= toYear)
                                  ) OR (
                                          timeType = 2
                                      AND (qtcttn.NGAY_QUYET_DINH IS NOT NULL AND
                                           (fromYear IS NULL OR qtcttn.NGAY_QUYET_DINH >= fromYear))
                                      AND (toYear IS NULL OR qtcttn.NGAY_QUYET_DINH <= toYear)
                                  ))
                         AND (tinhTrang IS NULL OR (qtcttn.BAT_DAU > today AND tinhTrang = 3) OR
                              (qtcttn.BAT_DAU <= today AND qtcttn.KET_THUC >= today AND tinhTrang = 2) OR
                              (qtcttn.KET_THUC < today AND tinhTrang = 1))))
                 ORDER BY qtcttn.BAT_DAU DESC
             );
    RETURN my_cursor;

END;

/
--EndMethod--

CREATE OR REPLACE FUNCTION QT_CONG_TAC_TRONG_NUOC_GROUP_PAGE(pageNumber IN OUT NUMBER, pageSize IN OUT NUMBER,
                                                  list_shcc IN STRING, list_dv IN STRING,
                                                  fromYear IN NUMBER, toYear IN NUMBER, timeType IN NUMBER,
                                                  tinhTrang IN NUMBER,
                                                  loaiHocVi IN STRING, mucDich IN STRING, searchTerm IN STRING,
                                                  totalItem OUT NUMBER, pageTotal OUT NUMBER) RETURN SYS_REFCURSOR
AS
    my_cursor SYS_REFCURSOR;
    sT        STRING(500) := '%' || lower(searchTerm) || '%';
    today     NUMBER(20);
BEGIN
    select (cast(sysdate as date) - cast(to_date('1970-01-01', 'YYYY-MM-DD') as date)) * 86400000 into today from dual;
    SELECT COUNT(*)
    INTO totalItem

    FROM (SELECT *
          FROM QT_CONG_TAC_TRONG_NUOC
          WHERE ID IN
                (SELECT MAX(ID) FROM (SELECT * FROM QT_CONG_TAC_TRONG_NUOC ORDER BY SHCC DESC) GROUP BY SHCC)) qtcttn
             LEFT JOIN TCHC_CAN_BO cb on qtcttn.SHCC = cb.SHCC
             LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
             LEFT JOIN DM_CHUC_VU cv ON (cb.MA_CHUC_VU = cv.MA)
             LEFT JOIN DM_TRINH_DO td ON (cb.HOC_VI = td.MA)
             LEFT JOIN DM_NGACH_CDNN cdnn ON (cdnn.MA = cb.NGACH);

    IF pageNumber < 1 THEN pageNumber := 1; END IF;
    IF pageSize < 1 THEN pageSize := 1; END IF;
    pageTotal := CEIL(totalItem / pageSize);
    pageNumber := LEAST(pageNumber, pageTotal);

    OPEN my_cursor FOR
        SELECT *
        FROM (SELECT qtcttn.ID                            AS   "id",
                     qtcttn.SHCC                          AS   "shcc",

                     (SELECT COUNT(*)
                      FROM QT_CONG_TAC_TRONG_NUOC qtcttn_temp
                               LEFT JOIN TCHC_CAN_BO cb on qtcttn_temp.SHCC = cb.SHCC
                               LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
                               LEFT JOIN DM_MUC_DICH_TRONG_NUOC DMDTN on qtcttn_temp.VIET_TAT = DMDTN.MA
                      WHERE (qtcttn_temp.SHCC = qtcttn.SHCC)
                        AND (((list_shcc IS NULL) AND (list_dv IS NULL) AND (fromYear IS NULL) AND (toYear IS NULL) AND
                              (timeType IS NULL) AND (tinhTrang IS NULL) AND (loaiHocVi IS NULL) AND (mucDich IS NULL))
                          OR (((list_shcc IS NOT NULL AND cb.SHCC IN (SELECT regexp_substr(list_shcc, '[^,]+', 1, level)
                                                                      from dual
                                                                      connect by regexp_substr(list_shcc, '[^,]+', 1, level) is not null))
                              OR (list_dv IS NOT NULL AND
                                  cb.MA_DON_VI IN (SELECT regexp_substr(list_dv, '[^,]+', 1, level)
                                                   from dual
                                                   connect by regexp_substr(list_dv, '[^,]+', 1, level) is not null))
                              OR (list_shcc IS NULL AND list_dv IS NULL))
                              AND (loaiHocVi IS NULL OR INSTR(loaiHocVi, cb.HOC_VI) != 0)
                              AND (mucDich IS NULL OR INSTR(mucDich, qtcttn_temp.VIET_TAT) != 0)
                              AND (timeType IS NULL OR (
                                          timeType = 0 AND
                                          (qtcttn_temp.BAT_DAU IS NOT NULL AND
                                           (fromYear IS NULL OR qtcttn_temp.BAT_DAU >= fromYear)) AND
                                          (toYear IS NULL OR qtcttn_temp.BAT_DAU <= toYear)
                                  ) OR (
                                               timeType = 1 AND
                                               (qtcttn_temp.KET_THUC IS NOT NULL AND
                                                (fromYear IS NULL OR qtcttn_temp.KET_THUC >= fromYear)) AND
                                               (toYear IS NULL OR qtcttn_temp.KET_THUC <= toYear)
                                       ) OR (
                                               timeType = 2
                                           AND (qtcttn_temp.NGAY_QUYET_DINH IS NOT NULL AND
                                                (fromYear IS NULL OR qtcttn_temp.NGAY_QUYET_DINH >= fromYear))
                                           AND (toYear IS NULL OR qtcttn_temp.NGAY_QUYET_DINH <= toYear)
                                       ))
                              AND (tinhTrang IS NULL OR (qtcttn_temp.BAT_DAU > today AND tinhTrang = 3) OR
                                   (qtcttn_temp.BAT_DAU <= today AND qtcttn_temp.KET_THUC >= today AND tinhTrang = 2) OR
                                   (qtcttn_temp.KET_THUC < today AND tinhTrang = 1))))
                        AND (searchTerm = ''
                          OR LOWER(cb.SHCC) LIKE sT
                          OR LOWER(TRIM(cb.HO || ' ' || cb.TEN)) LIKE sT
                          OR LOWER(qtcttn_temp.LY_DO) LIKE sT
                          OR LOWER(DMDTN.MO_TA) LIKE sT)) AS   "soQuaTrinh",

                     (select rtrim(xmlagg(xmlelement(e, qtcttn_temp.BAT_DAU || ' ', '??').extract('//text()') order by
                                          null).getclobval(), '??')
                      FROM QT_CONG_TAC_TRONG_NUOC qtcttn_temp
                               LEFT JOIN TCHC_CAN_BO cb on qtcttn_temp.SHCC = cb.SHCC
                               LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
                               LEFT JOIN DM_MUC_DICH_TRONG_NUOC DMDTN on qtcttn_temp.VIET_TAT = DMDTN.MA
                      WHERE (qtcttn_temp.SHCC = qtcttn.SHCC)
                        AND (((list_shcc IS NULL) AND (list_dv IS NULL) AND (fromYear IS NULL) AND (toYear IS NULL) AND
                              (timeType IS NULL) AND (tinhTrang IS NULL) AND (loaiHocVi IS NULL) AND (mucDich IS NULL))
                          OR (((list_shcc IS NOT NULL AND cb.SHCC IN (SELECT regexp_substr(list_shcc, '[^,]+', 1, level)
                                                                      from dual
                                                                      connect by regexp_substr(list_shcc, '[^,]+', 1, level) is not null))
                              OR (list_dv IS NOT NULL AND
                                  cb.MA_DON_VI IN (SELECT regexp_substr(list_dv, '[^,]+', 1, level)
                                                   from dual
                                                   connect by regexp_substr(list_dv, '[^,]+', 1, level) is not null))
                              OR (list_shcc IS NULL AND list_dv IS NULL))
                              AND (loaiHocVi IS NULL OR INSTR(loaiHocVi, cb.HOC_VI) != 0)
                              AND (mucDich IS NULL OR INSTR(mucDich, qtcttn_temp.VIET_TAT) != 0)
                              AND (timeType IS NULL OR (
                                          timeType = 0 AND
                                          (qtcttn_temp.BAT_DAU IS NOT NULL AND
                                           (fromYear IS NULL OR qtcttn_temp.BAT_DAU >= fromYear)) AND
                                          (toYear IS NULL OR qtcttn_temp.BAT_DAU <= toYear)
                                  ) OR (
                                               timeType = 1 AND
                                               (qtcttn_temp.KET_THUC IS NOT NULL AND
                                                (fromYear IS NULL OR qtcttn_temp.KET_THUC >= fromYear)) AND
                                               (toYear IS NULL OR qtcttn_temp.KET_THUC <= toYear)
                                       ) OR (
                                               timeType = 2
                                           AND (qtcttn_temp.NGAY_QUYET_DINH IS NOT NULL AND
                                                (fromYear IS NULL OR qtcttn_temp.NGAY_QUYET_DINH >= fromYear))
                                           AND (toYear IS NULL OR qtcttn_temp.NGAY_QUYET_DINH <= toYear)
                                       ))
                              AND (tinhTrang IS NULL OR (qtcttn_temp.BAT_DAU > today AND tinhTrang = 3) OR
                                   (qtcttn_temp.BAT_DAU <= today AND qtcttn_temp.KET_THUC >= today AND tinhTrang = 2) OR
                                   (qtcttn_temp.KET_THUC < today AND tinhTrang = 1))))
                        AND (searchTerm = ''
                          OR LOWER(cb.SHCC) LIKE sT
                          OR LOWER(TRIM(cb.HO || ' ' || cb.TEN)) LIKE sT
                          OR LOWER(qtcttn_temp.LY_DO) LIKE sT
                          OR LOWER(DMDTN.MO_TA) LIKE sT)) AS   "danhSachBatDau",

                     (select rtrim(xmlagg(xmlelement(e, qtcttn_temp.BAT_DAU_TYPE || ' ', '??').extract('//text()') order
                                          by null).getclobval(), '??')
                      FROM QT_CONG_TAC_TRONG_NUOC qtcttn_temp
                               LEFT JOIN TCHC_CAN_BO cb on qtcttn_temp.SHCC = cb.SHCC
                               LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
                               LEFT JOIN DM_MUC_DICH_TRONG_NUOC DMDTN on qtcttn_temp.VIET_TAT = DMDTN.MA
                      WHERE (qtcttn_temp.SHCC = qtcttn.SHCC)
                        AND (((list_shcc IS NULL) AND (list_dv IS NULL) AND (fromYear IS NULL) AND (toYear IS NULL) AND
                              (timeType IS NULL) AND (tinhTrang IS NULL) AND (loaiHocVi IS NULL) AND (mucDich IS NULL))
                          OR (((list_shcc IS NOT NULL AND cb.SHCC IN (SELECT regexp_substr(list_shcc, '[^,]+', 1, level)
                                                                      from dual
                                                                      connect by regexp_substr(list_shcc, '[^,]+', 1, level) is not null))
                              OR (list_dv IS NOT NULL AND
                                  cb.MA_DON_VI IN (SELECT regexp_substr(list_dv, '[^,]+', 1, level)
                                                   from dual
                                                   connect by regexp_substr(list_dv, '[^,]+', 1, level) is not null))
                              OR (list_shcc IS NULL AND list_dv IS NULL))
                              AND (loaiHocVi IS NULL OR INSTR(loaiHocVi, cb.HOC_VI) != 0)
                              AND (mucDich IS NULL OR INSTR(mucDich, qtcttn_temp.VIET_TAT) != 0)
                              AND (timeType IS NULL OR (
                                          timeType = 0 AND
                                          (qtcttn_temp.BAT_DAU IS NOT NULL AND
                                           (fromYear IS NULL OR qtcttn_temp.BAT_DAU >= fromYear)) AND
                                          (toYear IS NULL OR qtcttn_temp.BAT_DAU <= toYear)
                                  ) OR (
                                               timeType = 1 AND
                                               (qtcttn_temp.KET_THUC IS NOT NULL AND
                                                (fromYear IS NULL OR qtcttn_temp.KET_THUC >= fromYear)) AND
                                               (toYear IS NULL OR qtcttn_temp.KET_THUC <= toYear)
                                       ) OR (
                                               timeType = 2
                                           AND (qtcttn_temp.NGAY_QUYET_DINH IS NOT NULL AND
                                                (fromYear IS NULL OR qtcttn_temp.NGAY_QUYET_DINH >= fromYear))
                                           AND (toYear IS NULL OR qtcttn_temp.NGAY_QUYET_DINH <= toYear)
                                       ))
                              AND (tinhTrang IS NULL OR (qtcttn_temp.BAT_DAU > today AND tinhTrang = 3) OR
                                   (qtcttn_temp.BAT_DAU <= today AND qtcttn_temp.KET_THUC >= today AND tinhTrang = 2) OR
                                   (qtcttn_temp.KET_THUC < today AND tinhTrang = 1))))
                        AND (searchTerm = ''
                          OR LOWER(cb.SHCC) LIKE sT
                          OR LOWER(TRIM(cb.HO || ' ' || cb.TEN)) LIKE sT
                          OR LOWER(qtcttn_temp.LY_DO) LIKE sT
                          OR LOWER(DMDTN.MO_TA) LIKE sT)) AS   "danhSachBatDauType",

                     (select rtrim(xmlagg(xmlelement(e, qtcttn_temp.KET_THUC || ' ', '??').extract('//text()') order by
                                          null).getclobval(), '??')
                      FROM QT_CONG_TAC_TRONG_NUOC qtcttn_temp
                               LEFT JOIN TCHC_CAN_BO cb on qtcttn_temp.SHCC = cb.SHCC
                               LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
                               LEFT JOIN DM_MUC_DICH_TRONG_NUOC DMDTN on qtcttn_temp.VIET_TAT = DMDTN.MA
                      WHERE (qtcttn_temp.SHCC = qtcttn.SHCC)
                        AND (((list_shcc IS NULL) AND (list_dv IS NULL) AND (fromYear IS NULL) AND (toYear IS NULL) AND
                              (timeType IS NULL) AND (tinhTrang IS NULL) AND (loaiHocVi IS NULL) AND (mucDich IS NULL))
                          OR (((list_shcc IS NOT NULL AND cb.SHCC IN (SELECT regexp_substr(list_shcc, '[^,]+', 1, level)
                                                                      from dual
                                                                      connect by regexp_substr(list_shcc, '[^,]+', 1, level) is not null))
                              OR (list_dv IS NOT NULL AND
                                  cb.MA_DON_VI IN (SELECT regexp_substr(list_dv, '[^,]+', 1, level)
                                                   from dual
                                                   connect by regexp_substr(list_dv, '[^,]+', 1, level) is not null))
                              OR (list_shcc IS NULL AND list_dv IS NULL))
                              AND (loaiHocVi IS NULL OR INSTR(loaiHocVi, cb.HOC_VI) != 0)
                              AND (mucDich IS NULL OR INSTR(mucDich, qtcttn_temp.VIET_TAT) != 0)
                              AND (timeType IS NULL OR (
                                          timeType = 0 AND
                                          (qtcttn_temp.BAT_DAU IS NOT NULL AND
                                           (fromYear IS NULL OR qtcttn_temp.BAT_DAU >= fromYear)) AND
                                          (toYear IS NULL OR qtcttn_temp.BAT_DAU <= toYear)
                                  ) OR (
                                               timeType = 1 AND
                                               (qtcttn_temp.KET_THUC IS NOT NULL AND
                                                (fromYear IS NULL OR qtcttn_temp.KET_THUC >= fromYear)) AND
                                               (toYear IS NULL OR qtcttn_temp.KET_THUC <= toYear)
                                       ) OR (
                                               timeType = 2
                                           AND (qtcttn_temp.NGAY_QUYET_DINH IS NOT NULL AND
                                                (fromYear IS NULL OR qtcttn_temp.NGAY_QUYET_DINH >= fromYear))
                                           AND (toYear IS NULL OR qtcttn_temp.NGAY_QUYET_DINH <= toYear)
                                       ))
                              AND (tinhTrang IS NULL OR (qtcttn_temp.BAT_DAU > today AND tinhTrang = 3) OR
                                   (qtcttn_temp.BAT_DAU <= today AND qtcttn_temp.KET_THUC >= today AND tinhTrang = 2) OR
                                   (qtcttn_temp.KET_THUC < today AND tinhTrang = 1))))
                        AND (searchTerm = ''
                          OR LOWER(cb.SHCC) LIKE sT
                          OR LOWER(TRIM(cb.HO || ' ' || cb.TEN)) LIKE sT
                          OR LOWER(qtcttn_temp.LY_DO) LIKE sT
                          OR LOWER(DMDTN.MO_TA) LIKE sT)) AS   "danhSachKetThuc",

                     (select rtrim(xmlagg(xmlelement(e, qtcttn_temp.KET_THUC_TYPE || ' ', '??').extract('//text()')
                                          order by null).getclobval(), '??')
                      FROM QT_CONG_TAC_TRONG_NUOC qtcttn_temp
                               LEFT JOIN TCHC_CAN_BO cb on qtcttn_temp.SHCC = cb.SHCC
                               LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
                               LEFT JOIN DM_MUC_DICH_TRONG_NUOC DMDTN on qtcttn_temp.VIET_TAT = DMDTN.MA
                      WHERE (qtcttn_temp.SHCC = qtcttn.SHCC)
                        AND (((list_shcc IS NULL) AND (list_dv IS NULL) AND (fromYear IS NULL) AND (toYear IS NULL) AND
                              (timeType IS NULL) AND (tinhTrang IS NULL) AND (loaiHocVi IS NULL) AND (mucDich IS NULL))
                          OR (((list_shcc IS NOT NULL AND cb.SHCC IN (SELECT regexp_substr(list_shcc, '[^,]+', 1, level)
                                                                      from dual
                                                                      connect by regexp_substr(list_shcc, '[^,]+', 1, level) is not null))
                              OR (list_dv IS NOT NULL AND
                                  cb.MA_DON_VI IN (SELECT regexp_substr(list_dv, '[^,]+', 1, level)
                                                   from dual
                                                   connect by regexp_substr(list_dv, '[^,]+', 1, level) is not null))
                              OR (list_shcc IS NULL AND list_dv IS NULL))
                              AND (loaiHocVi IS NULL OR INSTR(loaiHocVi, cb.HOC_VI) != 0)
                              AND (mucDich IS NULL OR INSTR(mucDich, qtcttn_temp.VIET_TAT) != 0)
                              AND (timeType IS NULL OR (
                                          timeType = 0 AND
                                          (qtcttn_temp.BAT_DAU IS NOT NULL AND
                                           (fromYear IS NULL OR qtcttn_temp.BAT_DAU >= fromYear)) AND
                                          (toYear IS NULL OR qtcttn_temp.BAT_DAU <= toYear)
                                  ) OR (
                                               timeType = 1 AND
                                               (qtcttn_temp.KET_THUC IS NOT NULL AND
                                                (fromYear IS NULL OR qtcttn_temp.KET_THUC >= fromYear)) AND
                                               (toYear IS NULL OR qtcttn_temp.KET_THUC <= toYear)
                                       ) OR (
                                               timeType = 2
                                           AND (qtcttn_temp.NGAY_QUYET_DINH IS NOT NULL AND
                                                (fromYear IS NULL OR qtcttn_temp.NGAY_QUYET_DINH >= fromYear))
                                           AND (toYear IS NULL OR qtcttn_temp.NGAY_QUYET_DINH <= toYear)
                                       ))
                              AND (tinhTrang IS NULL OR (qtcttn_temp.BAT_DAU > today AND tinhTrang = 3) OR
                                   (qtcttn_temp.BAT_DAU <= today AND qtcttn_temp.KET_THUC >= today AND tinhTrang = 2) OR
                                   (qtcttn_temp.KET_THUC < today AND tinhTrang = 1))))
                        AND (searchTerm = ''
                          OR LOWER(cb.SHCC) LIKE sT
                          OR LOWER(TRIM(cb.HO || ' ' || cb.TEN)) LIKE sT
                          OR LOWER(qtcttn_temp.LY_DO) LIKE sT
                          OR LOWER(DMDTN.MO_TA) LIKE sT)) AS   "danhSachKetThucType",

                     (select rtrim(xmlagg(xmlelement(e, DMDTN.MO_TA || ' ', '??').extract('//text()') order by
                                          null).getclobval(), '??')
                      FROM QT_CONG_TAC_TRONG_NUOC qtcttn_temp
                               LEFT JOIN TCHC_CAN_BO cb on qtcttn_temp.SHCC = cb.SHCC
                               LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
                               LEFT JOIN DM_MUC_DICH_TRONG_NUOC DMDTN on qtcttn_temp.VIET_TAT = DMDTN.MA
                      WHERE (qtcttn_temp.SHCC = qtcttn.SHCC)
                        AND (((list_shcc IS NULL) AND (list_dv IS NULL) AND (fromYear IS NULL) AND (toYear IS NULL) AND
                              (timeType IS NULL) AND (tinhTrang IS NULL) AND (loaiHocVi IS NULL) AND (mucDich IS NULL))
                          OR (((list_shcc IS NOT NULL AND cb.SHCC IN (SELECT regexp_substr(list_shcc, '[^,]+', 1, level)
                                                                      from dual
                                                                      connect by regexp_substr(list_shcc, '[^,]+', 1, level) is not null))
                              OR (list_dv IS NOT NULL AND
                                  cb.MA_DON_VI IN (SELECT regexp_substr(list_dv, '[^,]+', 1, level)
                                                   from dual
                                                   connect by regexp_substr(list_dv, '[^,]+', 1, level) is not null))
                              OR (list_shcc IS NULL AND list_dv IS NULL))
                              AND (loaiHocVi IS NULL OR INSTR(loaiHocVi, cb.HOC_VI) != 0)
                              AND (mucDich IS NULL OR INSTR(mucDich, qtcttn_temp.VIET_TAT) != 0)
                              AND (timeType IS NULL OR (
                                          timeType = 0 AND
                                          (qtcttn_temp.BAT_DAU IS NOT NULL AND
                                           (fromYear IS NULL OR qtcttn_temp.BAT_DAU >= fromYear)) AND
                                          (toYear IS NULL OR qtcttn_temp.BAT_DAU <= toYear)
                                  ) OR (
                                               timeType = 1 AND
                                               (qtcttn_temp.KET_THUC IS NOT NULL AND
                                                (fromYear IS NULL OR qtcttn_temp.KET_THUC >= fromYear)) AND
                                               (toYear IS NULL OR qtcttn_temp.KET_THUC <= toYear)
                                       ) OR (
                                               timeType = 2
                                           AND (qtcttn_temp.NGAY_QUYET_DINH IS NOT NULL AND
                                                (fromYear IS NULL OR qtcttn_temp.NGAY_QUYET_DINH >= fromYear))
                                           AND (toYear IS NULL OR qtcttn_temp.NGAY_QUYET_DINH <= toYear)
                                       ))
                              AND (tinhTrang IS NULL OR (qtcttn_temp.BAT_DAU > today AND tinhTrang = 3) OR
                                   (qtcttn_temp.BAT_DAU <= today AND qtcttn_temp.KET_THUC >= today AND tinhTrang = 2) OR
                                   (qtcttn_temp.KET_THUC < today AND tinhTrang = 1))))
                        AND (searchTerm = ''
                          OR LOWER(cb.SHCC) LIKE sT
                          OR LOWER(TRIM(cb.HO || ' ' || cb.TEN)) LIKE sT
                          OR LOWER(qtcttn_temp.LY_DO) LIKE sT
                          OR LOWER(DMDTN.MO_TA) LIKE sT)) AS   "danhSachMucDich",

                     today                                AS   "today",
                     cb.HO                                AS   "hoCanBo",
                     cb.TEN                               AS   "tenCanBo",

                     dv.MA                                AS   "maDonVi",
                     dv.TEN                               AS   "tenDonVi",

                     (SELECT DMCV.TEN
                      FROM QT_CHUC_VU QTCV
                               LEFT JOIN DM_CHUC_VU DMCV ON DMCV.MA = QTCV.MA_CHUC_VU
                      WHERE QTCV.SHCC = CB.SHCC
                        AND CHUC_VU_CHINH = 1)            AS   "tenChucVu",

                     (SELECT QTCV.MA_CHUC_VU
                      FROM QT_CHUC_VU QTCV
                      WHERE QTCV.SHCC = CB.SHCC
                        AND CHUC_VU_CHINH = 1)            AS   "maChucVu",

                     td.MA                                AS   "maHocVi",
                     td.TEN                               AS   "tenHocVi",

                     cdnn.MA                              AS   "maChucDanhNgheNghiep",
                     cdnn.TEN                             AS   "tenChucDanhNgheNghiep",
                     ROW_NUMBER() OVER (ORDER BY BAT_DAU DESC) R
              FROM (SELECT *
                    FROM QT_CONG_TAC_TRONG_NUOC
                    WHERE ID IN (SELECT MAX(ID)
                                 FROM (SELECT * FROM QT_CONG_TAC_TRONG_NUOC ORDER BY SHCC DESC)
                                 GROUP BY SHCC)) qtcttn
                       LEFT JOIN TCHC_CAN_BO cb on qtcttn.SHCC = cb.SHCC
                       LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
                       LEFT JOIN DM_TRINH_DO td ON (cb.HOC_VI = td.MA)
                       LEFT JOIN DM_NGACH_CDNN cdnn ON (cdnn.MA = cb.NGACH)
              ORDER BY qtcttn.BAT_DAU DESC)
        WHERE R BETWEEN (pageNumber - 1) * pageSize + 1 AND pageNumber * pageSize;
    RETURN my_cursor;

END;

/
--EndMethod--

CREATE OR REPLACE FUNCTION QT_CONG_TAC_TRONG_NUOC_SEARCH_PAGE(pageNumber IN OUT NUMBER, pageSize IN OUT NUMBER,
                                                   list_shcc IN STRING, list_dv IN STRING,
                                                   fromYear IN NUMBER, toYear IN NUMBER, timeType IN NUMBER,
                                                   tinhTrang IN NUMBER,
                                                   loaiHocVi IN STRING, mucDich IN STRING, searchTerm IN STRING,
                                                   totalItem OUT NUMBER, pageTotal OUT NUMBER) RETURN SYS_REFCURSOR
AS
    my_cursor SYS_REFCURSOR;
    sT        STRING(500) := '%' || lower(searchTerm) || '%';
    today     NUMBER(20);
BEGIN
    select (cast(sysdate as date) - cast(to_date('1970-01-01', 'YYYY-MM-DD') as date)) * 86400000 into today from dual;
    SELECT COUNT(*)
    INTO totalItem

    FROM QT_CONG_TAC_TRONG_NUOC qtcttn
             LEFT JOIN TCHC_CAN_BO cb on qtcttn.SHCC = cb.SHCC
             LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
             LEFT JOIN DM_MUC_DICH_TRONG_NUOC DMDTN on qtcttn.VIET_TAT = DMDTN.MA
             LEFT JOIN DM_TRINH_DO td ON (cb.HOC_VI = td.MA)
             LEFT JOIN DM_NGACH_CDNN cdnn ON (cdnn.MA = cb.NGACH)
    WHERE (((list_shcc IS NULL) AND (list_dv IS NULL) AND (fromYear IS NULL) AND (toYear IS NULL) AND
            (timeType IS NULL) AND (tinhTrang IS NULL) AND (loaiHocVi IS NULL) AND (mucDich IS NULL))
        OR (((list_shcc IS NOT NULL AND cb.SHCC IN (SELECT regexp_substr(list_shcc, '[^,]+', 1, level)
                                                    from dual
                                                    connect by regexp_substr(list_shcc, '[^,]+', 1, level) is not null))
            OR (list_dv IS NOT NULL AND cb.MA_DON_VI IN (SELECT regexp_substr(list_dv, '[^,]+', 1, level)
                                                         from dual
                                                         connect by regexp_substr(list_dv, '[^,]+', 1, level) is not null))
            OR (list_shcc IS NULL AND list_dv IS NULL))
            AND (loaiHocVi IS NULL OR INSTR(loaiHocVi, cb.HOC_VI) != 0)
            AND (mucDich IS NULL OR INSTR(mucDich, qtcttn.VIET_TAT) != 0)
            AND (timeType IS NULL OR (
                        timeType = 0 AND
                        (qtcttn.BAT_DAU IS NOT NULL AND
                         (fromYear IS NULL OR qtcttn.BAT_DAU >= fromYear)) AND
                        (toYear IS NULL OR qtcttn.BAT_DAU <= toYear)
                ) OR (
                             timeType = 1 AND
                             (qtcttn.KET_THUC IS NOT NULL AND
                              (fromYear IS NULL OR qtcttn.KET_THUC >= fromYear)) AND
                             (toYear IS NULL OR qtcttn.KET_THUC <= toYear)
                     ) OR (
                             timeType = 2
                         AND (qtcttn.NGAY_QUYET_DINH IS NOT NULL AND
                              (fromYear IS NULL OR qtcttn.NGAY_QUYET_DINH >= fromYear))
                         AND (toYear IS NULL OR qtcttn.NGAY_QUYET_DINH <= toYear)
                     ))
            AND (tinhTrang IS NULL OR (qtcttn.BAT_DAU > today AND tinhTrang = 3) OR
                 (qtcttn.BAT_DAU <= today AND qtcttn.KET_THUC >= today AND tinhTrang = 2) OR
                 (qtcttn.KET_THUC < today AND tinhTrang = 1))))
      AND (searchTerm = ''
        OR LOWER(cb.SHCC) LIKE sT
        OR LOWER(TRIM(cb.HO || ' ' || cb.TEN)) LIKE sT
        OR LOWER(qtcttn.LY_DO) LIKE sT
        OR LOWER(DMDTN.MO_TA) LIKE sT);

    IF pageNumber < 1 THEN pageNumber := 1; END IF;
    IF pageSize < 1 THEN pageSize := 1; END IF;
    pageTotal := CEIL(totalItem / pageSize);
    pageNumber := LEAST(pageNumber, pageTotal);

    OPEN my_cursor FOR
        SELECT *
        FROM (SELECT qtcttn.ID                                    AS "id",
                     qtcttn.LY_DO                                 AS "lyDo",
                     qtcttn.NOI_DEN                               AS "noiDen",
                     qtcttn.SHCC                                  AS "shcc",
                     qtcttn.VIET_TAT                              AS "vietTat",
                     qtcttn.BAT_DAU                               AS "batDau",
                     qtcttn.BAT_DAU_TYPE                          AS "batDauType",
                     qtcttn.KET_THUC                              AS "ketThuc",
                     qtcttn.KET_THUC_TYPE                         AS "ketThucType",
                     qtcttn.KINH_PHI                              AS "kinhPhi",
                     qtcttn.GHI_CHU                               AS "ghiChu",
                     qtcttn.SO_CV                                 AS "soCv",
                     qtcttn.NGAY_QUYET_DINH                       AS "ngayQuyetDinh",

                     (select rtrim(xmlagg(xmlelement(e, dmttp.TEN, ', ').extract('//text()') order by
                                          null).getclobval(), ', ')
                      FROM DM_TINH_THANH_PHO dmttp
                      WHERE INSTR(qtcttn.NOI_DEN, dmttp.MA) != 0) AS "danhSachTinh",

                     today                                        AS "today",
                     cb.HO                                        AS "hoCanBo",
                     cb.TEN                                       AS "tenCanBo",

                     dv.MA                                        AS "maDonVi",
                     dv.TEN                                       AS "tenDonVi",
                     DMDTN.MO_TA                                  AS "tenMucDich",

                     (SELECT DMCV.TEN
                      FROM QT_CHUC_VU QTCV
                               LEFT JOIN DM_CHUC_VU DMCV ON DMCV.MA = QTCV.MA_CHUC_VU
                      WHERE QTCV.SHCC = CB.SHCC
                        AND CHUC_VU_CHINH = 1)                    AS "tenChucVu",

                     (SELECT QTCV.MA_CHUC_VU
                      FROM QT_CHUC_VU QTCV
                      WHERE QTCV.SHCC = CB.SHCC
                        AND CHUC_VU_CHINH = 1)                    AS "maChucVu",

                     td.MA                                        AS "maHocVi",
                     td.TEN                                       AS "tenHocVi",

                     cdnn.MA                                      AS "maChucDanhNgheNghiep",
                     cdnn.TEN                                     AS "tenChucDanhNgheNghiep",
                     ROW_NUMBER() OVER (ORDER BY BAT_DAU DESC)       R
              FROM QT_CONG_TAC_TRONG_NUOC qtcttn
                       LEFT JOIN TCHC_CAN_BO cb on qtcttn.SHCC = cb.SHCC
                       LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
                       LEFT JOIN DM_MUC_DICH_TRONG_NUOC DMDTN on qtcttn.VIET_TAT = DMDTN.MA
                       LEFT JOIN DM_TRINH_DO td ON (cb.HOC_VI = td.MA)
                       LEFT JOIN DM_NGACH_CDNN cdnn ON (cdnn.MA = cb.NGACH)
              WHERE (((list_shcc IS NULL) AND (list_dv IS NULL) AND (fromYear IS NULL) AND (toYear IS NULL) AND
                      (timeType IS NULL) AND (tinhTrang IS NULL) AND (loaiHocVi IS NULL) AND (mucDich IS NULL))
                  OR (((list_shcc IS NOT NULL AND cb.SHCC IN (SELECT regexp_substr(list_shcc, '[^,]+', 1, level)
                                                              from dual
                                                              connect by regexp_substr(list_shcc, '[^,]+', 1, level) is not null))
                      OR (list_dv IS NOT NULL AND cb.MA_DON_VI IN (SELECT regexp_substr(list_dv, '[^,]+', 1, level)
                                                                   from dual
                                                                   connect by regexp_substr(list_dv, '[^,]+', 1, level) is not null))
                      OR (list_shcc IS NULL AND list_dv IS NULL))
                      AND (loaiHocVi IS NULL OR INSTR(loaiHocVi, cb.HOC_VI) != 0)
                      AND (mucDich IS NULL OR INSTR(mucDich, qtcttn.VIET_TAT) != 0)
                      AND (timeType IS NULL OR (
                                  timeType = 0 AND
                                  (qtcttn.BAT_DAU IS NOT NULL AND
                                   (fromYear IS NULL OR qtcttn.BAT_DAU >= fromYear)) AND
                                  (toYear IS NULL OR qtcttn.BAT_DAU <= toYear)
                          ) OR (
                                       timeType = 1 AND
                                       (qtcttn.KET_THUC IS NOT NULL AND
                                        (fromYear IS NULL OR qtcttn.KET_THUC >= fromYear)) AND
                                       (toYear IS NULL OR qtcttn.KET_THUC <= toYear)
                               ) OR (
                                       timeType = 2
                                   AND (qtcttn.NGAY_QUYET_DINH IS NOT NULL AND
                                        (fromYear IS NULL OR qtcttn.NGAY_QUYET_DINH >= fromYear))
                                   AND (toYear IS NULL OR qtcttn.NGAY_QUYET_DINH <= toYear)
                               ))
                      AND (tinhTrang IS NULL OR (qtcttn.BAT_DAU > today AND tinhTrang = 3) OR
                           (qtcttn.BAT_DAU <= today AND qtcttn.KET_THUC >= today AND tinhTrang = 2) OR
                           (qtcttn.KET_THUC < today AND tinhTrang = 1))))
                AND (searchTerm = ''
                  OR LOWER(cb.SHCC) LIKE sT
                  OR LOWER(TRIM(cb.HO || ' ' || cb.TEN)) LIKE sT
                  OR LOWER(qtcttn.LY_DO) LIKE sT
                  OR LOWER(DMDTN.MO_TA) LIKE sT)
              ORDER BY qtcttn.BAT_DAU DESC)
        WHERE R BETWEEN (pageNumber - 1) * pageSize + 1 AND pageNumber * pageSize;
    RETURN my_cursor;

END;

/
--EndMethod--

CREATE OR REPLACE FUNCTION QT_DAO_TAO_DOWNLOAD_EXCEL(list_shcc IN STRING, list_dv IN STRING,
                                       fromYear IN NUMBER, toYear IN NUMBER, list_loaiBang IN STRING) RETURN SYS_REFCURSOR
AS
    my_cursor SYS_REFCURSOR;
BEGIN
    OPEN my_cursor FOR
        SELECT *
        FROM (
                 SELECT qtdt.ID                    as             "id",
                        qtdt.SHCC                  as             "shcc",
                        qtdt.TEN_TRUONG            as             "tenCoSoDaoTao",
                        qtdt.CHUYEN_NGANH          as             "chuyenNganh",
                        qtdt.BAT_DAU               as             "batDau",
                        qtdt.BAT_DAU_TYPE          as             "batDauType",
                        qtdt.KET_THUC              as             "ketThuc",
                        qtdt.KET_THUC_TYPE         as             "ketThucType",
                        qtdt.HINH_THUC             as             "hinhThuc",
                        qtdt.LOAI_BANG_CAP         as             "loaiBangCap",
                        qtdt.TRINH_DO              as             "trinhDo",
                        qtdt.KINH_PHI              as             "kinhPhi",

                        cb.TEN                     as             "tenCanBo",
                        cb.HO                      as             "hoCanBo",
                        cb.PHAI                    as             "gioiTinhCanBo",
                        cb.NGAY_SINH               as             "ngaySinhCanBo",
                        dv.MA                      AS             "maDonVi",
                        dv.TEN                     AS             "tenDonVi",
                        bdt.TEN                    as             "tenLoaiBangCap",
                        htdt.TEN                   as             "tenHinhThuc",
                        TDDT.TEN                   AS             "tenTrinhDo"
                 FROM QT_DAO_TAO qtdt
                          LEFT JOIN TCHC_CAN_BO cb on qtdt.SHCC = cb.SHCC
                          LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
                          LEFT JOIN DM_BANG_DAO_TAO bdt on qtdt.LOAI_BANG_CAP = bdt.MA
                          LEFT JOIN DM_HINH_THUC_DAO_TAO htdt on qtdt.HINH_THUC = htdt.MA
                          LEFT JOIN DM_TRINH_DO_DAO_TAO TDDT ON TDDT.MA = qtdt.TRINH_DO
                 WHERE (((list_shcc IS NULL) AND (list_dv IS NULL) AND (fromYear IS NULL) AND (toYear IS NULL) AND
                            (list_loaiBang IS NULL))
                        OR (((list_shcc IS NOT NULL AND
                              ((INSTR(list_shcc, ',') != 0 AND INSTR(list_shcc, qtdt.SHCC) != 0) OR (list_shcc = qtdt.SHCC)))
                            OR (list_dv IS NOT NULL AND INSTR(list_dv, cb.MA_DON_VI) != 0)
                            OR (list_loaiBang IS NOT NULL AND INSTR(list_loaiBang, qtdt.LOAI_BANG_CAP) != 0)
                            OR (list_shcc IS NULL AND list_dv IS NULL AND list_loaiBang IS NULL))
                            AND (qtdt.BAT_DAU IS NULL OR (qtdt.BAT_DAU IS NOT NULL AND (fromYear IS NULL OR qtdt.BAT_DAU >= fromYear)))
                            AND (qtdt.KET_THUC IS NULL OR (qtdt.KET_THUC IS NOT NULL AND (toYear IS NULL OR qtdt.KET_THUC <= (toYear + 86399999))))))
                 ORDER BY qtdt.BAT_DAU DESC NULLS LAST, cb.TEN DESC
             );
    RETURN my_cursor;

END;

/
--EndMethod--

CREATE OR REPLACE FUNCTION QT_DAO_TAO_GET_BY_SHCC(isSHCC in STRING) RETURN SYS_REFCURSOR
AS
    my_cursor SYS_REFCURSOR;
BEGIN
    OPEN my_cursor FOR
        SELECT DT.ID                    AS "id",
               DT.SHCC                  AS "shcc",
               CB.HO                    AS "ho",
               CB.TEN                   AS "ten",
               DT.TEN_TRUONG            AS "tenTruong",
               DT.CHUYEN_NGANH          AS "chuyenNganh",
               DT.BAT_DAU               AS "batDau",
               DT.BAT_DAU_TYPE          AS "batDauType",
               DT.KET_THUC              AS "ketThuc",
               DT.KET_THUC_TYPE         AS "ketThucType",
               DT.THOI_GIAN             AS "thoiGian",
               DT.TRINH_DO              AS "trinhDo",

               LBC.TEN                  AS "tenLoaiBangCap",
               TDDT.TEN                 AS "tenTrinhDo",
               HTDT.TEN                 AS "tenHinhThuc",
               DT.LOAI_BANG_CAP         AS "loaiBangCap",
               DT.HINH_THUC             AS "hinhThuc"
        FROM QT_DAO_TAO DT
                 LEFT JOIN TCHC_CAN_BO CB ON DT.SHCC = CB.SHCC
                 LEFT JOIN DM_BANG_DAO_TAO LBC ON TO_CHAR(DT.LOAI_BANG_CAP) = TO_CHAR(LBC.MA)
                 LEFT JOIN DM_TRINH_DO_DAO_TAO TDDT ON TO_CHAR(TDDT.MA) = DT.TRINH_DO
                 LEFT JOIN DM_HINH_THUC_DAO_TAO HTDT ON TO_CHAR(DT.HINH_THUC) = TO_CHAR(HTDT.MA)
        WHERE DT.SHCC = isSHCC;
    RETURN my_cursor;
END;

/
--EndMethod--

CREATE OR REPLACE function QT_DAO_TAO_GET_CURRENT_OF_STAFF(iSHCC in string, iTime in NUMBER) RETURN SYS_REFCURSOR
AS
    my_cursor SYS_REFCURSOR;

begin
    open my_cursor FOR
        select DT.ID            AS "id",
               DT.SHCC          AS "shcc",
               CB.HO            AS "ho",
               CB.TEN           AS "ten",
               DT.TEN_TRUONG    AS "tenTruong",
               DT.MINH_CHUNG    AS "minhChung",
               DT.CHUYEN_NGANH  AS "chuyenNganh",
               DT.BAT_DAU       AS "batDau",
               DT.BAT_DAU_TYPE  AS "batDauType",
               DT.KET_THUC      AS "ketThuc",
               DT.KET_THUC_TYPE AS "ketThucType",
               DT.THOI_GIAN     AS "thoiGian",
               DT.TRINH_DO      AS "trinhDo",

               LBC.TEN          AS "tenLoaiBangCap",
               TDDT.TEN         AS "tenTrinhDo",
               HTDT.TEN         AS "tenHinhThuc",
               DT.LOAI_BANG_CAP AS "loaiBangCap",
               DT.HINH_THUC     AS "hinhThuc"
        FROM (SELECT *
              FROM QT_DAO_TAO
              WHERE QT_DAO_TAO.SHCC = iSHCC
                AND ((KET_THUC = -1)
                  OR (BAT_DAU IS NOT NULL AND KET_THUC IS NOT NULL AND BAT_DAU <= iTime AND KET_THUC >= iTime))) DT
                 LEFT JOIN TCHC_CAN_BO CB ON DT.SHCC = CB.SHCC
                 LEFT JOIN DM_BANG_DAO_TAO LBC ON TO_CHAR(DT.LOAI_BANG_CAP) = TO_CHAR(LBC.MA)
                 LEFT JOIN DM_TRINH_DO_DAO_TAO TDDT ON TO_CHAR(TDDT.MA) = DT.TRINH_DO
                 LEFT JOIN DM_HINH_THUC_DAO_TAO HTDT ON TO_CHAR(DT.HINH_THUC) = TO_CHAR(HTDT.MA)
        WHERE DT.SHCC = iSHCC;
    RETURN my_cursor;
end;

/
--EndMethod--

CREATE OR REPLACE function QT_DAO_TAO_GET_HOC_VI_CAN_BO(iSHCC in string) RETURN SYS_REFCURSOR
AS
    my_cursor SYS_REFCURSOR;

begin
    open my_cursor FOR
        select DT.ID                    AS "id",
               DT.SHCC                  AS "shcc",
               CB.HO                    AS "ho",
               CB.TEN                   AS "ten",
               DT.MINH_CHUNG            AS "minhChung",
               DT.TEN_TRUONG            AS "tenTruong",
               DT.CHUYEN_NGANH          AS "chuyenNganh",
               DT.BAT_DAU               AS "batDau",
               DT.BAT_DAU_TYPE          AS "batDauType",
               DT.KET_THUC              AS "ketThuc",
               DT.KET_THUC_TYPE         AS "ketThucType",
               DT.THOI_GIAN             AS "thoiGian",
               DT.TRINH_DO              AS "trinhDo",
               LBC.TEN                  AS "tenLoaiBangCap",
               TDDT.TEN                 AS "tenTrinhDo",
               HTDT.TEN                 AS "tenHinhThuc",
               DT.LOAI_BANG_CAP         AS "loaiBangCap",
               DT.HINH_THUC             AS "hinhThuc"
            FROM QT_DAO_TAO DT
            LEFT JOIN TCHC_CAN_BO CB ON DT.SHCC = CB.SHCC
                 LEFT JOIN DM_BANG_DAO_TAO LBC ON TO_CHAR(DT.LOAI_BANG_CAP) = TO_CHAR(LBC.MA)
                 LEFT JOIN DM_TRINH_DO_DAO_TAO TDDT ON TO_CHAR(TDDT.MA) = DT.TRINH_DO
                 LEFT JOIN DM_HINH_THUC_DAO_TAO HTDT ON TO_CHAR(DT.HINH_THUC) = TO_CHAR(HTDT.MA)
            WHERE DT.SHCC = iSHCC AND (DT.KET_THUC IS NULL OR DT.KET_THUC != -1);
    RETURN my_cursor;
end;

/
--EndMethod--

CREATE OR REPLACE FUNCTION QT_DAO_TAO_GROUP_PAGE(pageNumber IN OUT NUMBER, pageSize IN OUT NUMBER,
                                      filter IN STRING, searchTerm IN STRING,
                                      totalItem OUT NUMBER, pageTotal OUT NUMBER) RETURN SYS_REFCURSOR
AS
    my_cursor    SYS_REFCURSOR;
    ST           STRING(500) := '%' || lower(searchTerm) || '%';
    listShcc     STRING(200);
    listDv       STRING(100);
    fromYear     NUMBER(20);
    toYear       NUMBER(20);
    listLoaiBang STRING(100);
BEGIN

    SELECT JSON_VALUE(filter, '$.listShcc') INTO listShcc FROM DUAL;
    SELECT JSON_VALUE(filter, '$.listDv') INTO listDv FROM DUAL;
    SELECT JSON_VALUE(filter, '$.fromYear' RETURNING NUMBER) INTO fromYear FROM DUAL;
    SELECT JSON_VALUE(filter, '$.toYear' RETURNING NUMBER) INTO toYear FROM DUAL;
    SELECT JSON_VALUE(filter, '$.listLoaiBang') INTO listLoaiBang FROM DUAL;

    SELECT COUNT(*)
    INTO totalItem
    FROM (SELECT *
          FROM QT_DAO_TAO
          WHERE ID IN (SELECT MAX(ID) FROM (SELECT * FROM QT_DAO_TAO ORDER BY SHCC DESC) GROUP BY SHCC)) qtdt
             LEFT JOIN TCHC_CAN_BO cb on qtdt.SHCC = cb.SHCC
             LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
             LEFT JOIN DM_CHUC_VU cv ON (cb.MA_CHUC_VU = cv.MA)
             LEFT JOIN DM_TRINH_DO td ON (cb.HOC_VI = td.MA)
             LEFT JOIN DM_NGACH_CDNN cdnn ON (cdnn.MA = cb.NGACH)
    WHERE ((fromYear IS NULL OR fromYear = 0 OR (qtdt.BAT_DAU IS NOT NULL AND qtdt.BAT_DAU >= fromYear)) AND
           (toYear IS NULL OR toYear = 0 OR (qtdt.KET_THUC IS NOT NULL AND qtdt.KET_THUC <= toYear + 86399999)))
      AND (listLoaiBang IS NULL OR
           (listLoaiBang IS NOT NULL AND qtdt.LOAI_BANG_CAP IN (SELECT regexp_substr(listLoaiBang, '[^,]+', 1, level)
                                                                from dual
                                                                connect by regexp_substr(listLoaiBang, '[^,]+', 1, level) is not null)))
      AND (listShcc IS NULL OR
           (listShcc IS NOT NULL AND qtdt.SHCC IN (SELECT regexp_substr(listShcc, '[^,]+', 1, level)
                                                   from dual
                                                   connect by regexp_substr(listShcc, '[^,]+', 1, level) is not null)))
      AND (listDv IS NULL OR
           (listDv IS NOT NULL AND cb.MA_DON_VI IN (SELECT regexp_substr(listDv, '[^,]+', 1, level)
                                                    from dual
                                                    connect by regexp_substr(listDv, '[^,]+', 1, level) is not null)))
      AND (searchTerm = ''
        OR LOWER(cb.SHCC) LIKE ST
        OR LOWER(TRIM(cb.HO || ' ' || cb.TEN)) LIKE ST);

    IF pageNumber < 1 THEN pageNumber := 1; END IF;
    IF pageSize < 1 THEN pageSize := 1; END IF;
    pageTotal := CEIL(totalItem / pageSize);
    pageNumber := LEAST(pageNumber, pageTotal);

    OPEN my_cursor FOR
        SELECT *
        FROM (SELECT qtdt.ID                                 as "id",
                     qtdt.SHCC                               as "shcc",
                     qtdt.TEN_TRUONG                         as "tenTruong",
                     qtdt.CHUYEN_NGANH                       as "chuyenNganh",
                     qtdt.BAT_DAU                            as "batDau",
                     qtdt.BAT_DAU_TYPE                       as "batDauType",
                     qtdt.KET_THUC                           as "ketThuc",
                     qtdt.KET_THUC_TYPE                      as "ketThucType",
                     qtdt.HINH_THUC                          as "hinhThuc",
                     qtdt.LOAI_BANG_CAP                      as "loaiBangCap",
                     qtdt.TRINH_DO                           as "trinhDo",
                     qtdt.KINH_PHI                           as "kinhPhi",
                     qtdt.MINH_CHUNG                         as "minhChung",
                     (SELECT COUNT(*)
                      FROM QT_DAO_TAO qtdt_temp
                      WHERE qtdt_temp.SHCC = qtdt.SHCC
                        AND (qtdt_temp.BAT_DAU IS NULL OR fromYear IS NULL OR
                             qtdt_temp.BAT_DAU >= fromYear)
                        AND (qtdt_temp.KET_THUC IS NULL OR toYear IS NULL OR
                             qtdt_temp.KET_THUC <= toYear))  AS "soQuaTrinh",

                     (Select listagg(qtdt_temp2.CHUYEN_NGANH, '??') within group ( order by null)
                      from QT_DAO_TAO qtdt_temp2
                      where qtdt_temp2.SHCC = qtdt.SHCC
                        AND (qtdt_temp2.BAT_DAU IS NULL OR fromYear IS NULL OR
                             qtdt_temp2.BAT_DAU >= fromYear)
                        AND (qtdt_temp2.KET_THUC IS NULL OR toYear IS NULL OR
                             qtdt_temp2.KET_THUC <= toYear)) AS "danhSachChuyenNganh",

                     cb.TEN                                  as "tenCanBo",
                     cb.HO                                   as "hoCanBo",
                     dv.MA                                   AS "maDonVi",
                     dv.TEN                                  AS "tenDonVi",
                     bdt.TEN                                 as "tenBDT",
                     htdt.TEN                                as "tenHTDT",

                     cv.MA                                   AS "maChucVu",
                     cv.TEN                                  AS "tenChucVu",

                     td.MA                                   AS "maHocVi",
                     td.TEN                                  AS "tenHocVi",

                     cdnn.MA                                 AS "maChucDanhNgheNghiep",
                     cdnn.TEN                                AS "tenChucDanhNgheNghiep",
                     ROW_NUMBER() OVER (ORDER BY qtdt.BAT_DAU)  R
              FROM (SELECT *
                    FROM QT_DAO_TAO
                    WHERE ID IN (SELECT MAX(ID) FROM (SELECT * FROM QT_DAO_TAO ORDER BY SHCC DESC) GROUP BY SHCC)) qtdt
                       LEFT JOIN TCHC_CAN_BO cb on qtdt.SHCC = cb.SHCC
                       LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
                       LEFT JOIN DM_BANG_DAO_TAO bdt on qtdt.LOAI_BANG_CAP = bdt.MA
                       LEFT JOIN DM_HINH_THUC_DAO_TAO htdt on qtdt.HINH_THUC = htdt.MA
                       LEFT JOIN DM_CHUC_VU cv ON (cb.MA_CHUC_VU = cv.MA)
                       LEFT JOIN DM_TRINH_DO td ON (cb.HOC_VI = td.MA)
                       LEFT JOIN DM_NGACH_CDNN cdnn ON (cdnn.MA = cb.NGACH)
              WHERE ((fromYear IS NULL OR fromYear = 0 OR (qtdt.BAT_DAU IS NOT NULL AND qtdt.BAT_DAU >= fromYear)) AND
                     (toYear IS NULL OR toYear = 0 OR
                      (qtdt.KET_THUC IS NOT NULL AND qtdt.KET_THUC <= toYear + 86399999)))
                AND (listLoaiBang IS NULL OR
                     (listLoaiBang IS NOT NULL AND
                      qtdt.LOAI_BANG_CAP IN (SELECT regexp_substr(listLoaiBang, '[^,]+', 1, level)
                                             from dual
                                             connect by regexp_substr(listLoaiBang, '[^,]+', 1, level) is not null)))
                AND (listShcc IS NULL OR
                     (listShcc IS NOT NULL AND qtdt.SHCC IN (SELECT regexp_substr(listShcc, '[^,]+', 1, level)
                                                             from dual
                                                             connect by regexp_substr(listShcc, '[^,]+', 1, level) is not null)))
                AND (listDv IS NULL OR
                     (listDv IS NOT NULL AND cb.MA_DON_VI IN (SELECT regexp_substr(listDv, '[^,]+', 1, level)
                                                              from dual
                                                              connect by regexp_substr(listDv, '[^,]+', 1, level) is not null)))
                AND (searchTerm = ''
                  OR LOWER(cb.SHCC) LIKE ST
                  OR LOWER(TRIM(cb.HO || ' ' || cb.TEN)) LIKE ST)
              ORDER BY qtdt.BAT_DAU)
        WHERE R BETWEEN (pageNumber - 1) * pageSize + 1 AND pageNumber * pageSize;
    RETURN my_cursor;

END;

/
--EndMethod--

CREATE OR REPLACE FUNCTION QT_DAO_TAO_SEARCH_PAGE(pageNumber IN OUT NUMBER, pageSize IN OUT NUMBER, filter IN STRING,
                                       searchTerm IN STRING,
                                       totalItem OUT NUMBER, pageTotal OUT NUMBER) RETURN SYS_REFCURSOR
AS
    my_cursor    SYS_REFCURSOR;
    ST           STRING(500) := '%' || lower(searchTerm) || '%';
    listShcc     STRING(200);
    listDv       STRING(100);
    fromYear     NUMBER(20);
    toYear       NUMBER(20);
    listLoaiBang STRING(100);

BEGIN
    SELECT JSON_VALUE(filter, '$.listShcc') INTO listShcc FROM DUAL;
    SELECT JSON_VALUE(filter, '$.listDv') INTO listDv FROM DUAL;
    SELECT JSON_VALUE(filter, '$.fromYear' RETURNING NUMBER) INTO fromYear FROM DUAL;
    SELECT JSON_VALUE(filter, '$.toYear' RETURNING NUMBER) INTO toYear FROM DUAL;
    SELECT JSON_VALUE(filter, '$.listLoaiBang') INTO listLoaiBang FROM DUAL;

    SELECT COUNT(*)
    INTO totalItem

    FROM QT_DAO_TAO qtdt
             LEFT JOIN TCHC_CAN_BO cb on qtdt.SHCC = cb.SHCC
             LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
             LEFT JOIN DM_BANG_DAO_TAO bdt on qtdt.LOAI_BANG_CAP = bdt.MA
             LEFT JOIN DM_HINH_THUC_DAO_TAO htdt on qtdt.HINH_THUC = htdt.MA
             LEFT JOIN DM_TRINH_DO_DAO_TAO TDDT ON TDDT.MA = qtdt.TRINH_DO
             LEFT JOIN DM_TRINH_DO td ON (cb.HOC_VI = td.MA)
             LEFT JOIN DM_NGACH_CDNN cdnn ON (cdnn.MA = cb.NGACH)
    WHERE ((fromYear IS NULL OR fromYear = 0 OR (qtdt.BAT_DAU IS NOT NULL AND qtdt.BAT_DAU >= fromYear)) AND
           (toYear IS NULL OR toYear = 0 OR (qtdt.KET_THUC IS NOT NULL AND qtdt.KET_THUC <= toYear + 86399999)))
      AND (listLoaiBang IS NULL OR
           (listLoaiBang IS NOT NULL AND qtdt.LOAI_BANG_CAP IN (SELECT regexp_substr(listLoaiBang, '[^,]+', 1, level)
                                                                from dual
                                                                connect by regexp_substr(listLoaiBang, '[^,]+', 1, level) is not null)))
      AND (listShcc IS NULL OR
           (listShcc IS NOT NULL AND qtdt.SHCC IN (SELECT regexp_substr(listShcc, '[^,]+', 1, level)
                                                   from dual
                                                   connect by regexp_substr(listShcc, '[^,]+', 1, level) is not null)))
      AND (listDv IS NULL OR
           (listDv IS NOT NULL AND cb.MA_DON_VI IN (SELECT regexp_substr(listDv, '[^,]+', 1, level)
                                                    from dual
                                                    connect by regexp_substr(listDv, '[^,]+', 1, level) is not null)))
      AND (searchTerm = ''
        OR LOWER(cb.SHCC) LIKE ST
        OR LOWER(TRIM(cb.HO || ' ' || cb.TEN)) LIKE ST);

    IF pageNumber < 1 THEN pageNumber := 1; END IF;
    IF pageSize < 1 THEN pageSize := 1; END IF;
    pageTotal := CEIL(totalItem / pageSize);
    pageNumber := LEAST(pageNumber, pageTotal);

    OPEN my_cursor FOR
        SELECT *
        FROM (SELECT qtdt.ID                   as              "id",
                     qtdt.SHCC                 as              "shcc",
                     qtdt.TEN_TRUONG           as              "tenTruong",
                     qtdt.CHUYEN_NGANH         as              "chuyenNganh",
                     qtdt.BAT_DAU              as              "batDau",
                     qtdt.BAT_DAU_TYPE         as              "batDauType",
                     qtdt.KET_THUC             as              "ketThuc",
                     qtdt.KET_THUC_TYPE        as              "ketThucType",
                     qtdt.HINH_THUC            as              "hinhThuc",
                     qtdt.LOAI_BANG_CAP        as              "loaiBangCap",
                     qtdt.TRINH_DO             as              "trinhDo",
                     qtdt.KINH_PHI             as              "kinhPhi",
                     qtdt.MINH_CHUNG           as              "minhChung",
                     cb.TEN                    as              "tenCanBo",
                     cb.HO                     as              "hoCanBo",
                     dv.MA                     AS              "maDonVi",
                     dv.TEN                    AS              "tenDonVi",
                     bdt.TEN                   as              "tenLoaiBangCap",
                     htdt.TEN                  as              "tenHinhThuc",
                     TDDT.TEN                  AS              "tenTrinhDo",

                     (SELECT DMCV.TEN
                      FROM QT_CHUC_VU QTCV
                               LEFT JOIN DM_CHUC_VU DMCV ON DMCV.MA = QTCV.MA_CHUC_VU
                      WHERE QTCV.SHCC = CB.SHCC
                        AND CHUC_VU_CHINH = 1) AS              "tenChucVu",

                     (SELECT QTCV.MA_CHUC_VU
                      FROM QT_CHUC_VU QTCV
                      WHERE QTCV.SHCC = CB.SHCC
                        AND CHUC_VU_CHINH = 1) AS              "maChucVu",
                     td.MA                     AS              "maHocVi",
                     td.TEN                    AS              "tenHocVi",

                     cdnn.MA                   AS              "maChucDanhNgheNghiep",
                     cdnn.TEN                  AS              "tenChucDanhNgheNghiep",
                     ROW_NUMBER() OVER (ORDER BY qtdt.ID DESC) R
              FROM QT_DAO_TAO qtdt
                       LEFT JOIN TCHC_CAN_BO cb on qtdt.SHCC = cb.SHCC
                       LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
                       LEFT JOIN DM_BANG_DAO_TAO bdt on qtdt.LOAI_BANG_CAP = bdt.MA
                       LEFT JOIN DM_HINH_THUC_DAO_TAO htdt on qtdt.HINH_THUC = htdt.MA
                       LEFT JOIN DM_TRINH_DO_DAO_TAO TDDT ON TDDT.MA = qtdt.TRINH_DO
                       LEFT JOIN DM_TRINH_DO td ON (cb.HOC_VI = td.MA)
                       LEFT JOIN DM_NGACH_CDNN cdnn ON (cdnn.MA = cb.NGACH)
              WHERE ((fromYear IS NULL OR fromYear = 0 OR (qtdt.BAT_DAU IS NOT NULL AND qtdt.BAT_DAU >= fromYear)) AND
                     (toYear IS NULL OR toYear = 0 OR
                      (qtdt.KET_THUC IS NOT NULL AND qtdt.KET_THUC <= toYear + 86399999)))
                AND (listLoaiBang IS NULL OR
                     (listLoaiBang IS NOT NULL AND
                      qtdt.LOAI_BANG_CAP IN (SELECT regexp_substr(listLoaiBang, '[^,]+', 1, level)
                                             from dual
                                             connect by regexp_substr(listLoaiBang, '[^,]+', 1, level) is not null)))
                AND (listShcc IS NULL OR
                     (listShcc IS NOT NULL AND qtdt.SHCC IN (SELECT regexp_substr(listShcc, '[^,]+', 1, level)
                                                             from dual
                                                             connect by regexp_substr(listShcc, '[^,]+', 1, level) is not null)))
                AND (listDv IS NULL OR
                     (listDv IS NOT NULL AND cb.MA_DON_VI IN (SELECT regexp_substr(listDv, '[^,]+', 1, level)
                                                              from dual
                                                              connect by regexp_substr(listDv, '[^,]+', 1, level) is not null)))
                AND (searchTerm = ''
                  OR LOWER(cb.SHCC) LIKE ST
                  OR LOWER(TRIM(cb.HO || ' ' || cb.TEN)) LIKE ST)
              ORDER BY qtdt.BAT_DAU DESC NULLS LAST, cb.TEN DESC)
        WHERE R BETWEEN (pageNumber - 1) * pageSize + 1 AND pageNumber * pageSize;
    RETURN my_cursor;

END;

/
--EndMethod--

CREATE OR REPLACE FUNCTION QT_DI_NUOC_NGOAI_DOWNLOAD_EXCEL(filter IN STRING, searchTerm IN STRING) RETURN SYS_REFCURSOR
AS
    my_cursor        SYS_REFCURSOR;
    sT               STRING(500) := '%' || lower(searchTerm) || '%';
    today            NUMBER(20);
    list_shcc        STRING(100);
    list_dv          STRING(100);
    fromYear         NUMBER;
    toYear           NUMBER;
    timeType         NUMBER;
    loaiHocVi        STRING(100);
    mucDich          STRING(100);
    tinhTrangCongTac NUMBER;
    tinhTrangBaoCao  NUMBER;
BEGIN
    /* Init filter */-------------------------------------------------------------------------------------
    SELECT JSON_VALUE(filter, '$.listDv') INTO list_dv FROM DUAL;
    SELECT JSON_VALUE(filter, '$.listShcc') INTO list_shcc FROM DUAL;
    SELECT JSON_VALUE(filter, '$.fromYear') INTO fromYear FROM DUAL;
    SELECT JSON_VALUE(filter, '$.toYear') INTO toYear FROM DUAL;
    SELECT JSON_VALUE(filter, '$.timeType') INTO timeType FROM DUAL;
    SELECT JSON_VALUE(filter, '$.loaiHocVi') INTO loaiHocVi FROM DUAL;
    SELECT JSON_VALUE(filter, '$.mucDich') INTO mucDich FROM DUAL;
    SELECT JSON_VALUE(filter, '$.tinhTrangCongTac') INTO tinhTrangCongTac FROM DUAL;
    SELECT JSON_VALUE(filter, '$.tinhTrangBaoCao') INTO tinhTrangBaoCao FROM DUAL;

    select (cast(sysdate as date) - cast(to_date('1970-01-01', 'YYYY-MM-DD') as date)) * 86400000 into today from dual;
    OPEN my_cursor FOR
        SELECT *
        FROM (SELECT qtdnn.ID                                         AS      "id",
                     qtdnn.NOI_DUNG                                   AS      "noiDung",
                     qtdnn.QUOC_GIA                                   AS      "quocGia",
                     qtdnn.SHCC                                       AS      "shcc",
                     qtdnn.MUC_DICH                                   AS      "mucDich",
                     qtdnn.NGAY_DI                                    AS      "ngayDi",
                     qtdnn.NGAY_DI_TYPE                               AS      "ngayDiType",
                     qtdnn.NGAY_VE                                    AS      "ngayVe",
                     qtdnn.NGAY_VE_TYPE                               AS      "ngayVeType",
                     qtdnn.CHI_PHI                                    AS      "chiPhi",
                     qtdnn.GHI_CHU                                    AS      "ghiChu",
                     qtdnn.SO_QUYET_DINH                              AS      "soQuyetDinh",
                     qtdnn.NGAY_QUYET_DINH                            AS      "ngayQuyetDinh",
                     qtdnn.SO_QD_TIEP_NHAN                            AS      "soQdTiepNhan",
                     qtdnn.NOI_DUNG_TIEP_NHAN                         AS      "noiDungTiepNhan",
                     tnvn.TEN                                         AS      "tenNoiDungTiepNhan",
                     qtdnn.NGAY_QD_TIEP_NHAN                          AS      "ngayQdTiepNhan",
                     qtdnn.NGAY_VE_NUOC                               AS      "ngayVeNuoc",
                     qtdnn.BAO_CAO_TINH_TRANG                         AS      "baoCaoTinhTrang",
                     qtdnn.BAO_CAO_TEN                                AS      "baoCaoTen",
                     qtdnn.BAO_CAO_LY_DO_TRA_VE                       AS      "baoCaoLyDoTraVe",

                     (select rtrim(xmlagg(xmlelement(e, dmqg.TEN_QUOC_GIA, ' - ').extract('//text()') order by
                                          null).getclobval(), ' - ')
                      FROM DM_QUOC_GIA dmqg
                      WHERE INSTR(qtdnn.QUOC_GIA, dmqg.MA_CODE) != 0) AS      "danhSachQuocGia",

                     today                                            AS      "today",
                     cb.HO                                            AS      "hoCanBo",
                     cb.TEN                                           AS      "tenCanBo",
                     cb.NGAY_SINH                                     AS      "ngaySinh",
                     cb.PHAI                                          AS      "phai",

                     dv.MA                                            AS      "maDonVi",
                     dv.TEN                                           AS      "tenDonVi",
                     DMDNN.MO_TA                                      AS      "tenMucDich",
                     (SELECT DMCV.TEN
                      FROM QT_CHUC_VU QTCV
                               LEFT JOIN DM_CHUC_VU DMCV ON DMCV.MA = QTCV.MA_CHUC_VU
                      WHERE QTCV.SHCC = CB.SHCC
                        AND CHUC_VU_CHINH = 1)                        AS      "tenChucVu",

                     (SELECT QTCV.MA_CHUC_VU
                      FROM QT_CHUC_VU QTCV
                      WHERE QTCV.SHCC = CB.SHCC
                        AND CHUC_VU_CHINH = 1)                        AS      "maChucVu",
                     td.MA                                            AS      "maHocVi",
                     td.TEN                                           AS      "tenHocVi",

                     cdnn.MA                                          AS      "maChucDanhNgheNghiep",
                     cdnn.TEN                                         AS      "tenChucDanhNgheNghiep",
                     ROW_NUMBER() OVER (ORDER BY cb.TEN, cb.HO, NGAY_DI DESC) R
              FROM QT_DI_NUOC_NGOAI qtdnn
                       LEFT JOIN TCHC_CAN_BO cb on qtdnn.SHCC = cb.SHCC
                       LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
                       LEFT JOIN DM_MUC_DICH_NUOC_NGOAI DMDNN on qtdnn.MUC_DICH = DMDNN.MA
                       LEFT JOIN DM_TRINH_DO td ON (cb.HOC_VI = td.MA)
                       LEFT JOIN DM_NGACH_CDNN cdnn ON (cdnn.MA = cb.NGACH)
                       LEFT JOIN DM_TIEP_NHAN_VE_NUOC tnvn ON (qtdnn.NOI_DUNG_TIEP_NHAN = tnvn.MA)
              WHERE (((list_shcc IS NULL) AND (list_dv IS NULL) AND (fromYear IS NULL) AND (toYear IS NULL) AND
                      (timeType IS NULL) AND (tinhTrangCongTac IS NULL) AND (loaiHocVi IS NULL) AND
                      (mucDich IS NULL) AND (tinhTrangBaoCao IS NULL))
                  OR (((list_shcc IS NOT NULL AND cb.SHCC IN (SELECT regexp_substr(list_shcc, '[^,]+', 1, level)
                                                              from dual
                                                              connect by regexp_substr(list_shcc, '[^,]+', 1, level) is not null))
                      OR (list_dv IS NOT NULL AND cb.MA_DON_VI IN (SELECT regexp_substr(list_dv, '[^,]+', 1, level)
                                                                   from dual
                                                                   connect by regexp_substr(list_dv, '[^,]+', 1, level) is not null))
                      OR (list_shcc IS NULL AND list_dv IS NULL))
                      AND (loaiHocVi IS NULL OR cb.HOC_VI IN (SELECT regexp_substr(loaiHocVi, '[^,]+', 1, level)
                                                              from dual
                                                              connect by regexp_substr(loaiHocVi, '[^,]+', 1, level) is not null))
                      AND (mucDich IS NULL OR qtdnn.MUC_DICH IN (SELECT regexp_substr(mucDich, '[^,]+', 1, level)
                                                                 from dual
                                                                 connect by regexp_substr(mucDich, '[^,]+', 1, level) is not null))
                      AND (timeType IS NULL OR (
                                  timeType = 1 AND
                                  (qtdnn.NGAY_DI IS NOT NULL AND (fromYear IS NULL OR qtdnn.NGAY_DI >= fromYear)) AND
                                  (toYear IS NULL OR qtdnn.NGAY_DI <= toYear)
                          ) OR (
                                       timeType = 2
                                   AND (qtdnn.NGAY_VE IS NOT NULL AND (fromYear IS NULL OR qtdnn.NGAY_VE >= fromYear))
                                   AND (toYear IS NULL OR qtdnn.NGAY_VE <= toYear)
                               ) OR (
                                       timeType = 3
                                   AND (qtdnn.NGAY_QUYET_DINH IS NOT NULL AND
                                        (fromYear IS NULL OR qtdnn.NGAY_QUYET_DINH >= fromYear))
                                   AND (toYear IS NULL OR qtdnn.NGAY_QUYET_DINH <= toYear)
                               ) OR (
                                       timeType = 4
                                   AND (qtdnn.NGAY_QD_TIEP_NHAN IS NOT NULL AND
                                        (fromYear IS NULL OR qtdnn.NGAY_QD_TIEP_NHAN >= fromYear))
                                   AND (toYear IS NULL OR qtdnn.NGAY_QD_TIEP_NHAN <= toYear)
                               ))
                      AND (tinhTrangCongTac IS NULL OR
                           (tinhTrangCongTac = 1 AND qtdnn.NGAY_VE < today and (qtdnn.SO_QD_TIEP_NHAN IS NOT NULL OR
                                                                                TRUNC(1 / 24 / 60 / 60 / 1000 * (qtdnn.NGAY_VE - qtdnn.NGAY_DI)) <
                                                                                30)) OR
                           (tinhTrangCongTac = 2 AND qtdnn.NGAY_VE < today and qtdnn.SO_QD_TIEP_NHAN IS NULL and
                            TRUNC(1 / 24 / 60 / 60 / 1000 * (qtdnn.NGAY_VE - qtdnn.NGAY_DI)) >= 30) OR
                           (tinhTrangCongTac = 3 AND qtdnn.NGAY_VE >= today AND qtdnn.NGAY_DI <= today) OR
                           (tinhTrangCongTac = 4 AND qtdnn.NGAY_DI > today))
                      AND (tinhTrangBaoCao IS NULL OR tinhTrangBaoCao = qtdnn.BAO_CAO_TINH_TRANG)
                         ))
                AND (searchTerm = ''
                  OR LOWER(cb.SHCC) LIKE sT
                  OR LOWER(TRIM(cb.HO || ' ' || cb.TEN)) LIKE sT
                  OR LOWER(qtdnn.NOI_DUNG) LIKE sT
                  OR LOWER(qtdnn.NOI_DUNG_TIEP_NHAN) LIKE sT
                  OR LOWER(DMDNN.MO_TA) LIKE sT)
              ORDER BY cb.TEN, cb.HO, NGAY_DI DESC);
    RETURN my_cursor;

END;

/
--EndMethod--

CREATE OR REPLACE FUNCTION QT_DI_NUOC_NGOAI_GROUP_PAGE(pageNumber IN OUT NUMBER, pageSize IN OUT NUMBER,
                                            filter IN STRING, searchTerm IN STRING,
                                            totalItem OUT NUMBER, pageTotal OUT NUMBER) RETURN SYS_REFCURSOR
AS
    my_cursor        SYS_REFCURSOR;
    sT               STRING(500) := '%' || lower(searchTerm) || '%';
    today            NUMBER(20);
    list_shcc        STRING(100);
    list_dv          STRING(100);
    fromYear         NUMBER;
    toYear           NUMBER;
    timeType         NUMBER;
    loaiHocVi        STRING(100);
    mucDich          STRING(100);
    tinhTrangCongTac NUMBER;
    tinhTrangBaoCao  NUMBER;
BEGIN
    /* Init filter */-------------------------------------------------------------------------------------
    SELECT JSON_VALUE(filter, '$.listDv') INTO list_dv FROM DUAL;
    SELECT JSON_VALUE(filter, '$.listShcc') INTO list_shcc FROM DUAL;
    SELECT JSON_VALUE(filter, '$.fromYear') INTO fromYear FROM DUAL;
    SELECT JSON_VALUE(filter, '$.toYear') INTO toYear FROM DUAL;
    SELECT JSON_VALUE(filter, '$.timeType') INTO timeType FROM DUAL;
    SELECT JSON_VALUE(filter, '$.loaiHocVi') INTO loaiHocVi FROM DUAL;
    SELECT JSON_VALUE(filter, '$.mucDich') INTO mucDich FROM DUAL;
    SELECT JSON_VALUE(filter, '$.tinhTrangCongTac') INTO tinhTrangCongTac FROM DUAL;
    SELECT JSON_VALUE(filter, '$.tinhTrangBaoCao') INTO tinhTrangBaoCao FROM DUAL;

    select (cast(sysdate as date) - cast(to_date('1970-01-01', 'YYYY-MM-DD') as date)) * 86400000 into today from dual;
    SELECT COUNT(*)
    INTO totalItem

    FROM (SELECT *
          FROM QT_DI_NUOC_NGOAI
          WHERE ID IN (SELECT MAX(ID) FROM (SELECT * FROM QT_DI_NUOC_NGOAI ORDER BY SHCC DESC) GROUP BY SHCC)) qtdnn
             LEFT JOIN TCHC_CAN_BO cb on qtdnn.SHCC = cb.SHCC
             LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
             LEFT JOIN DM_TRINH_DO td ON (cb.HOC_VI = td.MA)
             LEFT JOIN DM_NGACH_CDNN cdnn ON (cdnn.MA = cb.NGACH);
    IF pageNumber < 1 THEN pageNumber := 1; END IF;
    IF pageSize < 1 THEN pageSize := 1; END IF;
    pageTotal := CEIL(totalItem / pageSize);
    pageNumber := LEAST(pageNumber, pageTotal);

    OPEN my_cursor FOR
        SELECT *
        FROM (SELECT qtdnn.ID                             AS                  "id",
                     qtdnn.SHCC                           AS                  "shcc",

                     (SELECT COUNT(*)
                      FROM QT_DI_NUOC_NGOAI qtdnn_temp
                               LEFT JOIN TCHC_CAN_BO cb on qtdnn_temp.SHCC = cb.SHCC
                               LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
                               LEFT JOIN DM_MUC_DICH_NUOC_NGOAI DMDNN on qtdnn_temp.MUC_DICH = DMDNN.MA
                               LEFT JOIN DM_CHUC_VU cv ON (cb.MA_CHUC_VU = cv.MA)
                               LEFT JOIN DM_TRINH_DO td ON (cb.HOC_VI = td.MA)
                               LEFT JOIN DM_NGACH_CDNN cdnn ON (cdnn.MA = cb.NGACH)
                      WHERE (qtdnn_temp.SHCC = qtdnn.SHCC)
                        AND (((list_shcc IS NULL) AND (list_dv IS NULL) AND (fromYear IS NULL) AND (toYear IS NULL) AND
                              (timeType IS NULL) AND (tinhTrangCongTac IS NULL) AND (loaiHocVi IS NULL) AND
                              (mucDich IS NULL) AND (tinhTrangBaoCao IS NULL))
                          OR (((list_shcc IS NOT NULL AND cb.SHCC IN (SELECT regexp_substr(list_shcc, '[^,]+', 1, level)
                                                                      from dual
                                                                      connect by regexp_substr(list_shcc, '[^,]+', 1, level) is not null))
                              OR (list_dv IS NOT NULL AND
                                  cb.MA_DON_VI IN (SELECT regexp_substr(list_dv, '[^,]+', 1, level)
                                                   from dual
                                                   connect by regexp_substr(list_dv, '[^,]+', 1, level) is not null))
                              OR (list_shcc IS NULL AND list_dv IS NULL))
                              AND (loaiHocVi IS NULL OR cb.HOC_VI IN (SELECT regexp_substr(loaiHocVi, '[^,]+', 1, level)
                                                                      from dual
                                                                      connect by regexp_substr(loaiHocVi, '[^,]+', 1, level) is not null))
                              AND (mucDich IS NULL OR
                                   qtdnn_temp.MUC_DICH IN (SELECT regexp_substr(mucDich, '[^,]+', 1, level)
                                                           from dual
                                                           connect by regexp_substr(mucDich, '[^,]+', 1, level) is not null))
                              AND (timeType IS NULL OR (
                                          timeType = 1 AND
                                          (qtdnn_temp.NGAY_DI IS NOT NULL AND
                                           (fromYear IS NULL OR qtdnn_temp.NGAY_DI >= fromYear)) AND
                                          (toYear IS NULL OR qtdnn_temp.NGAY_DI <= toYear)
                                  ) OR (
                                               timeType = 2
                                           AND (qtdnn_temp.NGAY_VE IS NOT NULL AND
                                                (fromYear IS NULL OR qtdnn_temp.NGAY_VE >= fromYear))
                                           AND (toYear IS NULL OR qtdnn_temp.NGAY_VE <= toYear)
                                       ) OR (
                                               timeType = 3
                                           AND (qtdnn_temp.NGAY_QUYET_DINH IS NOT NULL AND
                                                (fromYear IS NULL OR qtdnn_temp.NGAY_QUYET_DINH >= fromYear))
                                           AND (toYear IS NULL OR qtdnn_temp.NGAY_QUYET_DINH <= toYear)
                                       ) OR (
                                               timeType = 4
                                           AND (qtdnn_temp.NGAY_QD_TIEP_NHAN IS NOT NULL AND
                                                (fromYear IS NULL OR qtdnn_temp.NGAY_QD_TIEP_NHAN >= fromYear))
                                           AND (toYear IS NULL OR qtdnn_temp.NGAY_QD_TIEP_NHAN <= toYear)
                                       ))
                              AND (tinhTrangCongTac IS NULL OR
                                   (tinhTrangCongTac = 1 AND qtdnn_temp.NGAY_VE < today and
                                    (qtdnn_temp.SO_QD_TIEP_NHAN IS NOT NULL OR
                                     TRUNC(1 / 24 / 60 / 60 / 1000 * (qtdnn_temp.NGAY_VE - qtdnn_temp.NGAY_DI)) <
                                     30)) OR
                                   (tinhTrangCongTac = 2 AND qtdnn_temp.NGAY_VE < today and
                                    qtdnn_temp.SO_QD_TIEP_NHAN IS NULL and
                                    TRUNC(1 / 24 / 60 / 60 / 1000 * (qtdnn_temp.NGAY_VE - qtdnn_temp.NGAY_DI)) >= 30) OR
                                   (tinhTrangCongTac = 3 AND qtdnn_temp.NGAY_VE >= today AND
                                    qtdnn_temp.NGAY_DI <= today) OR
                                   (tinhTrangCongTac = 4 AND qtdnn_temp.NGAY_DI > today))
                              AND (tinhTrangBaoCao IS NULL OR tinhTrangBaoCao = qtdnn_temp.BAO_CAO_TINH_TRANG)
                                 ))
                        AND (searchTerm = ''
                          OR LOWER(cb.SHCC) LIKE sT
                          OR LOWER(TRIM(cb.HO || ' ' || cb.TEN)) LIKE sT
                          OR LOWER(qtdnn_temp.NOI_DUNG) LIKE sT
                          OR LOWER(qtdnn_temp.NOI_DUNG_TIEP_NHAN) LIKE sT
                          OR LOWER(DMDNN.MO_TA) LIKE sT)) AS                  "soQuaTrinh",

                     (select rtrim(xmlagg(xmlelement(e, qtdnn_temp.NGAY_DI || ' ', '??').extract('//text()') order by
                                          null).getclobval(), '??')
                      FROM QT_DI_NUOC_NGOAI qtdnn_temp
                               LEFT JOIN TCHC_CAN_BO cb on qtdnn_temp.SHCC = cb.SHCC
                               LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
                               LEFT JOIN DM_MUC_DICH_NUOC_NGOAI DMDNN on qtdnn_temp.MUC_DICH = DMDNN.MA
                               LEFT JOIN DM_CHUC_VU cv ON (cb.MA_CHUC_VU = cv.MA)
                               LEFT JOIN DM_TRINH_DO td ON (cb.HOC_VI = td.MA)
                               LEFT JOIN DM_NGACH_CDNN cdnn ON (cdnn.MA = cb.NGACH)
                      WHERE (qtdnn_temp.SHCC = qtdnn.SHCC)
                        AND (((list_shcc IS NULL) AND (list_dv IS NULL) AND (fromYear IS NULL) AND (toYear IS NULL) AND
                              (timeType IS NULL) AND (tinhTrangCongTac IS NULL) AND (loaiHocVi IS NULL) AND
                              (mucDich IS NULL) AND (tinhTrangBaoCao IS NULL))
                          OR (((list_shcc IS NOT NULL AND cb.SHCC IN (SELECT regexp_substr(list_shcc, '[^,]+', 1, level)
                                                                      from dual
                                                                      connect by regexp_substr(list_shcc, '[^,]+', 1, level) is not null))
                              OR (list_dv IS NOT NULL AND
                                  cb.MA_DON_VI IN (SELECT regexp_substr(list_dv, '[^,]+', 1, level)
                                                   from dual
                                                   connect by regexp_substr(list_dv, '[^,]+', 1, level) is not null))
                              OR (list_shcc IS NULL AND list_dv IS NULL))
                              AND (loaiHocVi IS NULL OR cb.HOC_VI IN (SELECT regexp_substr(loaiHocVi, '[^,]+', 1, level)
                                                                      from dual
                                                                      connect by regexp_substr(loaiHocVi, '[^,]+', 1, level) is not null))
                              AND (mucDich IS NULL OR
                                   qtdnn_temp.MUC_DICH IN (SELECT regexp_substr(mucDich, '[^,]+', 1, level)
                                                           from dual
                                                           connect by regexp_substr(mucDich, '[^,]+', 1, level) is not null))
                              AND (timeType IS NULL OR (
                                          timeType = 1 AND
                                          (qtdnn_temp.NGAY_DI IS NOT NULL AND
                                           (fromYear IS NULL OR qtdnn_temp.NGAY_DI >= fromYear)) AND
                                          (toYear IS NULL OR qtdnn_temp.NGAY_DI <= toYear)
                                  ) OR (
                                               timeType = 2
                                           AND (qtdnn_temp.NGAY_VE IS NOT NULL AND
                                                (fromYear IS NULL OR qtdnn_temp.NGAY_VE >= fromYear))
                                           AND (toYear IS NULL OR qtdnn_temp.NGAY_VE <= toYear)
                                       ) OR (
                                               timeType = 3
                                           AND (qtdnn_temp.NGAY_QUYET_DINH IS NOT NULL AND
                                                (fromYear IS NULL OR qtdnn_temp.NGAY_QUYET_DINH >= fromYear))
                                           AND (toYear IS NULL OR qtdnn_temp.NGAY_QUYET_DINH <= toYear)
                                       ) OR (
                                               timeType = 4
                                           AND (qtdnn_temp.NGAY_QD_TIEP_NHAN IS NOT NULL AND
                                                (fromYear IS NULL OR qtdnn_temp.NGAY_QD_TIEP_NHAN >= fromYear))
                                           AND (toYear IS NULL OR qtdnn_temp.NGAY_QD_TIEP_NHAN <= toYear)
                                       ))
                              AND (tinhTrangCongTac IS NULL OR
                                   (tinhTrangCongTac = 1 AND qtdnn_temp.NGAY_VE < today and
                                    (qtdnn_temp.SO_QD_TIEP_NHAN IS NOT NULL OR
                                     TRUNC(1 / 24 / 60 / 60 / 1000 * (qtdnn_temp.NGAY_VE - qtdnn_temp.NGAY_DI)) <
                                     30)) OR
                                   (tinhTrangCongTac = 2 AND qtdnn_temp.NGAY_VE < today and
                                    qtdnn_temp.SO_QD_TIEP_NHAN IS NULL and
                                    TRUNC(1 / 24 / 60 / 60 / 1000 * (qtdnn_temp.NGAY_VE - qtdnn_temp.NGAY_DI)) >= 30) OR
                                   (tinhTrangCongTac = 3 AND qtdnn_temp.NGAY_VE >= today AND
                                    qtdnn_temp.NGAY_DI <= today) OR
                                   (tinhTrangCongTac = 4 AND qtdnn_temp.NGAY_DI > today))
                              AND (tinhTrangBaoCao IS NULL OR tinhTrangBaoCao = qtdnn_temp.BAO_CAO_TINH_TRANG)
                                 ))
                        AND (searchTerm = ''
                          OR LOWER(cb.SHCC) LIKE sT
                          OR LOWER(TRIM(cb.HO || ' ' || cb.TEN)) LIKE sT
                          OR LOWER(qtdnn_temp.NOI_DUNG) LIKE sT
                          OR LOWER(qtdnn_temp.NOI_DUNG_TIEP_NHAN) LIKE sT
                          OR LOWER(DMDNN.MO_TA) LIKE sT)) AS                  "danhSachNgayDi",

                     (select rtrim(xmlagg(xmlelement(e, qtdnn_temp.NGAY_DI_TYPE || ' ', '??').extract('//text()') order
                                          by null).getclobval(), '??')
                      FROM QT_DI_NUOC_NGOAI qtdnn_temp
                               LEFT JOIN TCHC_CAN_BO cb on qtdnn_temp.SHCC = cb.SHCC
                               LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
                               LEFT JOIN DM_MUC_DICH_NUOC_NGOAI DMDNN on qtdnn_temp.MUC_DICH = DMDNN.MA
                               LEFT JOIN DM_CHUC_VU cv ON (cb.MA_CHUC_VU = cv.MA)
                               LEFT JOIN DM_TRINH_DO td ON (cb.HOC_VI = td.MA)
                               LEFT JOIN DM_NGACH_CDNN cdnn ON (cdnn.MA = cb.NGACH)
                      WHERE (qtdnn_temp.SHCC = qtdnn.SHCC)
                        AND (((list_shcc IS NULL) AND (list_dv IS NULL) AND (fromYear IS NULL) AND (toYear IS NULL) AND
                              (timeType IS NULL) AND (tinhTrangCongTac IS NULL) AND (loaiHocVi IS NULL) AND
                              (mucDich IS NULL) AND (tinhTrangBaoCao IS NULL))
                          OR (((list_shcc IS NOT NULL AND cb.SHCC IN (SELECT regexp_substr(list_shcc, '[^,]+', 1, level)
                                                                      from dual
                                                                      connect by regexp_substr(list_shcc, '[^,]+', 1, level) is not null))
                              OR (list_dv IS NOT NULL AND
                                  cb.MA_DON_VI IN (SELECT regexp_substr(list_dv, '[^,]+', 1, level)
                                                   from dual
                                                   connect by regexp_substr(list_dv, '[^,]+', 1, level) is not null))
                              OR (list_shcc IS NULL AND list_dv IS NULL))
                              AND (loaiHocVi IS NULL OR cb.HOC_VI IN (SELECT regexp_substr(loaiHocVi, '[^,]+', 1, level)
                                                                      from dual
                                                                      connect by regexp_substr(loaiHocVi, '[^,]+', 1, level) is not null))
                              AND (mucDich IS NULL OR
                                   qtdnn_temp.MUC_DICH IN (SELECT regexp_substr(mucDich, '[^,]+', 1, level)
                                                           from dual
                                                           connect by regexp_substr(mucDich, '[^,]+', 1, level) is not null))
                              AND (timeType IS NULL OR (
                                          timeType = 1 AND
                                          (qtdnn_temp.NGAY_DI IS NOT NULL AND
                                           (fromYear IS NULL OR qtdnn_temp.NGAY_DI >= fromYear)) AND
                                          (toYear IS NULL OR qtdnn_temp.NGAY_DI <= toYear)
                                  ) OR (
                                               timeType = 2
                                           AND (qtdnn_temp.NGAY_VE IS NOT NULL AND
                                                (fromYear IS NULL OR qtdnn_temp.NGAY_VE >= fromYear))
                                           AND (toYear IS NULL OR qtdnn_temp.NGAY_VE <= toYear)
                                       ) OR (
                                               timeType = 3
                                           AND (qtdnn_temp.NGAY_QUYET_DINH IS NOT NULL AND
                                                (fromYear IS NULL OR qtdnn_temp.NGAY_QUYET_DINH >= fromYear))
                                           AND (toYear IS NULL OR qtdnn_temp.NGAY_QUYET_DINH <= toYear)
                                       ) OR (
                                               timeType = 4
                                           AND (qtdnn_temp.NGAY_QD_TIEP_NHAN IS NOT NULL AND
                                                (fromYear IS NULL OR qtdnn_temp.NGAY_QD_TIEP_NHAN >= fromYear))
                                           AND (toYear IS NULL OR qtdnn_temp.NGAY_QD_TIEP_NHAN <= toYear)
                                       ))
                              AND (tinhTrangCongTac IS NULL OR
                                   (tinhTrangCongTac = 1 AND qtdnn_temp.NGAY_VE < today and
                                    (qtdnn_temp.SO_QD_TIEP_NHAN IS NOT NULL OR
                                     TRUNC(1 / 24 / 60 / 60 / 1000 * (qtdnn_temp.NGAY_VE - qtdnn_temp.NGAY_DI)) <
                                     30)) OR
                                   (tinhTrangCongTac = 2 AND qtdnn_temp.NGAY_VE < today and
                                    qtdnn_temp.SO_QD_TIEP_NHAN IS NULL and
                                    TRUNC(1 / 24 / 60 / 60 / 1000 * (qtdnn_temp.NGAY_VE - qtdnn_temp.NGAY_DI)) >= 30) OR
                                   (tinhTrangCongTac = 3 AND qtdnn_temp.NGAY_VE >= today AND
                                    qtdnn_temp.NGAY_DI <= today) OR
                                   (tinhTrangCongTac = 4 AND qtdnn_temp.NGAY_DI > today))
                              AND (tinhTrangBaoCao IS NULL OR tinhTrangBaoCao = qtdnn_temp.BAO_CAO_TINH_TRANG)
                                 ))
                        AND (searchTerm = ''
                          OR LOWER(cb.SHCC) LIKE sT
                          OR LOWER(TRIM(cb.HO || ' ' || cb.TEN)) LIKE sT
                          OR LOWER(qtdnn_temp.NOI_DUNG) LIKE sT
                          OR LOWER(qtdnn_temp.NOI_DUNG_TIEP_NHAN) LIKE sT
                          OR LOWER(DMDNN.MO_TA) LIKE sT)) AS                  "danhSachNgayDiType",

                     (select rtrim(xmlagg(xmlelement(e, qtdnn_temp.NGAY_VE || ' ', '??').extract('//text()') order by
                                          null).getclobval(), '??')
                      FROM QT_DI_NUOC_NGOAI qtdnn_temp
                               LEFT JOIN TCHC_CAN_BO cb on qtdnn_temp.SHCC = cb.SHCC
                               LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
                               LEFT JOIN DM_MUC_DICH_NUOC_NGOAI DMDNN on qtdnn_temp.MUC_DICH = DMDNN.MA
                               LEFT JOIN DM_CHUC_VU cv ON (cb.MA_CHUC_VU = cv.MA)
                               LEFT JOIN DM_TRINH_DO td ON (cb.HOC_VI = td.MA)
                               LEFT JOIN DM_NGACH_CDNN cdnn ON (cdnn.MA = cb.NGACH)
                      WHERE (qtdnn_temp.SHCC = qtdnn.SHCC)
                        AND (((list_shcc IS NULL) AND (list_dv IS NULL) AND (fromYear IS NULL) AND (toYear IS NULL) AND
                              (timeType IS NULL) AND (tinhTrangCongTac IS NULL) AND (loaiHocVi IS NULL) AND
                              (mucDich IS NULL) AND (tinhTrangBaoCao IS NULL))
                          OR (((list_shcc IS NOT NULL AND cb.SHCC IN (SELECT regexp_substr(list_shcc, '[^,]+', 1, level)
                                                                      from dual
                                                                      connect by regexp_substr(list_shcc, '[^,]+', 1, level) is not null))
                              OR (list_dv IS NOT NULL AND
                                  cb.MA_DON_VI IN (SELECT regexp_substr(list_dv, '[^,]+', 1, level)
                                                   from dual
                                                   connect by regexp_substr(list_dv, '[^,]+', 1, level) is not null))
                              OR (list_shcc IS NULL AND list_dv IS NULL))
                              AND (loaiHocVi IS NULL OR cb.HOC_VI IN (SELECT regexp_substr(loaiHocVi, '[^,]+', 1, level)
                                                                      from dual
                                                                      connect by regexp_substr(loaiHocVi, '[^,]+', 1, level) is not null))
                              AND (mucDich IS NULL OR
                                   qtdnn_temp.MUC_DICH IN (SELECT regexp_substr(mucDich, '[^,]+', 1, level)
                                                           from dual
                                                           connect by regexp_substr(mucDich, '[^,]+', 1, level) is not null))
                              AND (timeType IS NULL OR (
                                          timeType = 1 AND
                                          (qtdnn_temp.NGAY_DI IS NOT NULL AND
                                           (fromYear IS NULL OR qtdnn_temp.NGAY_DI >= fromYear)) AND
                                          (toYear IS NULL OR qtdnn_temp.NGAY_DI <= toYear)
                                  ) OR (
                                               timeType = 2
                                           AND (qtdnn_temp.NGAY_VE IS NOT NULL AND
                                                (fromYear IS NULL OR qtdnn_temp.NGAY_VE >= fromYear))
                                           AND (toYear IS NULL OR qtdnn_temp.NGAY_VE <= toYear)
                                       ) OR (
                                               timeType = 3
                                           AND (qtdnn_temp.NGAY_QUYET_DINH IS NOT NULL AND
                                                (fromYear IS NULL OR qtdnn_temp.NGAY_QUYET_DINH >= fromYear))
                                           AND (toYear IS NULL OR qtdnn_temp.NGAY_QUYET_DINH <= toYear)
                                       ) OR (
                                               timeType = 4
                                           AND (qtdnn_temp.NGAY_QD_TIEP_NHAN IS NOT NULL AND
                                                (fromYear IS NULL OR qtdnn_temp.NGAY_QD_TIEP_NHAN >= fromYear))
                                           AND (toYear IS NULL OR qtdnn_temp.NGAY_QD_TIEP_NHAN <= toYear)
                                       ))
                              AND (tinhTrangCongTac IS NULL OR
                                   (tinhTrangCongTac = 1 AND qtdnn_temp.NGAY_VE < today and
                                    (qtdnn_temp.SO_QD_TIEP_NHAN IS NOT NULL OR
                                     TRUNC(1 / 24 / 60 / 60 / 1000 * (qtdnn_temp.NGAY_VE - qtdnn_temp.NGAY_DI)) <
                                     30)) OR
                                   (tinhTrangCongTac = 2 AND qtdnn_temp.NGAY_VE < today and
                                    qtdnn_temp.SO_QD_TIEP_NHAN IS NULL and
                                    TRUNC(1 / 24 / 60 / 60 / 1000 * (qtdnn_temp.NGAY_VE - qtdnn_temp.NGAY_DI)) >= 30) OR
                                   (tinhTrangCongTac = 3 AND qtdnn_temp.NGAY_VE >= today AND
                                    qtdnn_temp.NGAY_DI <= today) OR
                                   (tinhTrangCongTac = 4 AND qtdnn_temp.NGAY_DI > today))
                              AND (tinhTrangBaoCao IS NULL OR tinhTrangBaoCao = qtdnn_temp.BAO_CAO_TINH_TRANG)
                                 ))
                        AND (searchTerm = ''
                          OR LOWER(cb.SHCC) LIKE sT
                          OR LOWER(TRIM(cb.HO || ' ' || cb.TEN)) LIKE sT
                          OR LOWER(qtdnn_temp.NOI_DUNG) LIKE sT
                          OR LOWER(qtdnn_temp.NOI_DUNG_TIEP_NHAN) LIKE sT
                          OR LOWER(DMDNN.MO_TA) LIKE sT)) AS                  "danhSachNgayVe",

                     (select rtrim(xmlagg(xmlelement(e, qtdnn_temp.NGAY_VE_TYPE || ' ', '??').extract('//text()') order
                                          by null).getclobval(), '??')
                      FROM QT_DI_NUOC_NGOAI qtdnn_temp
                               LEFT JOIN TCHC_CAN_BO cb on qtdnn_temp.SHCC = cb.SHCC
                               LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
                               LEFT JOIN DM_MUC_DICH_NUOC_NGOAI DMDNN on qtdnn_temp.MUC_DICH = DMDNN.MA
                               LEFT JOIN DM_CHUC_VU cv ON (cb.MA_CHUC_VU = cv.MA)
                               LEFT JOIN DM_TRINH_DO td ON (cb.HOC_VI = td.MA)
                               LEFT JOIN DM_NGACH_CDNN cdnn ON (cdnn.MA = cb.NGACH)
                      WHERE (qtdnn_temp.SHCC = qtdnn.SHCC)
                        AND (((list_shcc IS NULL) AND (list_dv IS NULL) AND (fromYear IS NULL) AND (toYear IS NULL) AND
                              (timeType IS NULL) AND (tinhTrangCongTac IS NULL) AND (loaiHocVi IS NULL) AND
                              (mucDich IS NULL) AND (tinhTrangBaoCao IS NULL))
                          OR (((list_shcc IS NOT NULL AND cb.SHCC IN (SELECT regexp_substr(list_shcc, '[^,]+', 1, level)
                                                                      from dual
                                                                      connect by regexp_substr(list_shcc, '[^,]+', 1, level) is not null))
                              OR (list_dv IS NOT NULL AND
                                  cb.MA_DON_VI IN (SELECT regexp_substr(list_dv, '[^,]+', 1, level)
                                                   from dual
                                                   connect by regexp_substr(list_dv, '[^,]+', 1, level) is not null))
                              OR (list_shcc IS NULL AND list_dv IS NULL))
                              AND (loaiHocVi IS NULL OR cb.HOC_VI IN (SELECT regexp_substr(loaiHocVi, '[^,]+', 1, level)
                                                                      from dual
                                                                      connect by regexp_substr(loaiHocVi, '[^,]+', 1, level) is not null))
                              AND (mucDich IS NULL OR
                                   qtdnn_temp.MUC_DICH IN (SELECT regexp_substr(mucDich, '[^,]+', 1, level)
                                                           from dual
                                                           connect by regexp_substr(mucDich, '[^,]+', 1, level) is not null))
                              AND (timeType IS NULL OR (
                                          timeType = 1 AND
                                          (qtdnn_temp.NGAY_DI IS NOT NULL AND
                                           (fromYear IS NULL OR qtdnn_temp.NGAY_DI >= fromYear)) AND
                                          (toYear IS NULL OR qtdnn_temp.NGAY_DI <= toYear)
                                  ) OR (
                                               timeType = 2
                                           AND (qtdnn_temp.NGAY_VE IS NOT NULL AND
                                                (fromYear IS NULL OR qtdnn_temp.NGAY_VE >= fromYear))
                                           AND (toYear IS NULL OR qtdnn_temp.NGAY_VE <= toYear)
                                       ) OR (
                                               timeType = 3
                                           AND (qtdnn_temp.NGAY_QUYET_DINH IS NOT NULL AND
                                                (fromYear IS NULL OR qtdnn_temp.NGAY_QUYET_DINH >= fromYear))
                                           AND (toYear IS NULL OR qtdnn_temp.NGAY_QUYET_DINH <= toYear)
                                       ) OR (
                                               timeType = 4
                                           AND (qtdnn_temp.NGAY_QD_TIEP_NHAN IS NOT NULL AND
                                                (fromYear IS NULL OR qtdnn_temp.NGAY_QD_TIEP_NHAN >= fromYear))
                                           AND (toYear IS NULL OR qtdnn_temp.NGAY_QD_TIEP_NHAN <= toYear)
                                       ))
                              AND (tinhTrangCongTac IS NULL OR
                                   (tinhTrangCongTac = 1 AND qtdnn_temp.NGAY_VE < today and
                                    (qtdnn_temp.SO_QD_TIEP_NHAN IS NOT NULL OR
                                     TRUNC(1 / 24 / 60 / 60 / 1000 * (qtdnn_temp.NGAY_VE - qtdnn_temp.NGAY_DI)) <
                                     30)) OR
                                   (tinhTrangCongTac = 2 AND qtdnn_temp.NGAY_VE < today and
                                    qtdnn_temp.SO_QD_TIEP_NHAN IS NULL and
                                    TRUNC(1 / 24 / 60 / 60 / 1000 * (qtdnn_temp.NGAY_VE - qtdnn_temp.NGAY_DI)) >= 30) OR
                                   (tinhTrangCongTac = 3 AND qtdnn_temp.NGAY_VE >= today AND
                                    qtdnn_temp.NGAY_DI <= today) OR
                                   (tinhTrangCongTac = 4 AND qtdnn_temp.NGAY_DI > today))
                              AND (tinhTrangBaoCao IS NULL OR tinhTrangBaoCao = qtdnn_temp.BAO_CAO_TINH_TRANG)
                                 ))
                        AND (searchTerm = ''
                          OR LOWER(cb.SHCC) LIKE sT
                          OR LOWER(TRIM(cb.HO || ' ' || cb.TEN)) LIKE sT
                          OR LOWER(qtdnn_temp.NOI_DUNG) LIKE sT
                          OR LOWER(qtdnn_temp.NOI_DUNG_TIEP_NHAN) LIKE sT
                          OR LOWER(DMDNN.MO_TA) LIKE sT)) AS                  "danhSachNgayVeType",

                     (select rtrim(xmlagg(xmlelement(e, DMDNN.MO_TA || ' ', '??').extract('//text()') order by
                                          null).getclobval(), '??')
                      FROM QT_DI_NUOC_NGOAI qtdnn_temp
                               LEFT JOIN TCHC_CAN_BO cb on qtdnn_temp.SHCC = cb.SHCC
                               LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
                               LEFT JOIN DM_MUC_DICH_NUOC_NGOAI DMDNN on qtdnn_temp.MUC_DICH = DMDNN.MA
                               LEFT JOIN DM_CHUC_VU cv ON (cb.MA_CHUC_VU = cv.MA)
                               LEFT JOIN DM_TRINH_DO td ON (cb.HOC_VI = td.MA)
                               LEFT JOIN DM_NGACH_CDNN cdnn ON (cdnn.MA = cb.NGACH)
                      WHERE (qtdnn_temp.SHCC = qtdnn.SHCC)
                        AND (((list_shcc IS NULL) AND (list_dv IS NULL) AND (fromYear IS NULL) AND (toYear IS NULL) AND
                              (timeType IS NULL) AND (tinhTrangCongTac IS NULL) AND (loaiHocVi IS NULL) AND
                              (mucDich IS NULL) AND (tinhTrangBaoCao IS NULL))
                          OR (((list_shcc IS NOT NULL AND cb.SHCC IN (SELECT regexp_substr(list_shcc, '[^,]+', 1, level)
                                                                      from dual
                                                                      connect by regexp_substr(list_shcc, '[^,]+', 1, level) is not null))
                              OR (list_dv IS NOT NULL AND
                                  cb.MA_DON_VI IN (SELECT regexp_substr(list_dv, '[^,]+', 1, level)
                                                   from dual
                                                   connect by regexp_substr(list_dv, '[^,]+', 1, level) is not null))
                              OR (list_shcc IS NULL AND list_dv IS NULL))
                              AND (loaiHocVi IS NULL OR cb.HOC_VI IN (SELECT regexp_substr(loaiHocVi, '[^,]+', 1, level)
                                                                      from dual
                                                                      connect by regexp_substr(loaiHocVi, '[^,]+', 1, level) is not null))
                              AND (mucDich IS NULL OR
                                   qtdnn_temp.MUC_DICH IN (SELECT regexp_substr(mucDich, '[^,]+', 1, level)
                                                           from dual
                                                           connect by regexp_substr(mucDich, '[^,]+', 1, level) is not null))
                              AND (timeType IS NULL OR (
                                          timeType = 1 AND
                                          (qtdnn_temp.NGAY_DI IS NOT NULL AND
                                           (fromYear IS NULL OR qtdnn_temp.NGAY_DI >= fromYear)) AND
                                          (toYear IS NULL OR qtdnn_temp.NGAY_DI <= toYear)
                                  ) OR (
                                               timeType = 2
                                           AND (qtdnn_temp.NGAY_VE IS NOT NULL AND
                                                (fromYear IS NULL OR qtdnn_temp.NGAY_VE >= fromYear))
                                           AND (toYear IS NULL OR qtdnn_temp.NGAY_VE <= toYear)
                                       ) OR (
                                               timeType = 3
                                           AND (qtdnn_temp.NGAY_QUYET_DINH IS NOT NULL AND
                                                (fromYear IS NULL OR qtdnn_temp.NGAY_QUYET_DINH >= fromYear))
                                           AND (toYear IS NULL OR qtdnn_temp.NGAY_QUYET_DINH <= toYear)
                                       ) OR (
                                               timeType = 4
                                           AND (qtdnn_temp.NGAY_QD_TIEP_NHAN IS NOT NULL AND
                                                (fromYear IS NULL OR qtdnn_temp.NGAY_QD_TIEP_NHAN >= fromYear))
                                           AND (toYear IS NULL OR qtdnn_temp.NGAY_QD_TIEP_NHAN <= toYear)
                                       ))
                              AND (tinhTrangCongTac IS NULL OR
                                   (tinhTrangCongTac = 1 AND qtdnn_temp.NGAY_VE < today and
                                    (qtdnn_temp.SO_QD_TIEP_NHAN IS NOT NULL OR
                                     TRUNC(1 / 24 / 60 / 60 / 1000 * (qtdnn_temp.NGAY_VE - qtdnn_temp.NGAY_DI)) <
                                     30)) OR
                                   (tinhTrangCongTac = 2 AND qtdnn_temp.NGAY_VE < today and
                                    qtdnn_temp.SO_QD_TIEP_NHAN IS NULL and
                                    TRUNC(1 / 24 / 60 / 60 / 1000 * (qtdnn_temp.NGAY_VE - qtdnn_temp.NGAY_DI)) >= 30) OR
                                   (tinhTrangCongTac = 3 AND qtdnn_temp.NGAY_VE >= today AND
                                    qtdnn_temp.NGAY_DI <= today) OR
                                   (tinhTrangCongTac = 4 AND qtdnn_temp.NGAY_DI > today))
                              AND (tinhTrangBaoCao IS NULL OR tinhTrangBaoCao = qtdnn_temp.BAO_CAO_TINH_TRANG)
                                 ))
                        AND (searchTerm = ''
                          OR LOWER(cb.SHCC) LIKE sT
                          OR LOWER(TRIM(cb.HO || ' ' || cb.TEN)) LIKE sT
                          OR LOWER(qtdnn_temp.NOI_DUNG) LIKE sT
                          OR LOWER(qtdnn_temp.NOI_DUNG_TIEP_NHAN) LIKE sT
                          OR LOWER(DMDNN.MO_TA) LIKE sT)) AS                  "danhSachMucDich",

                     today                                AS                  "today",
                     cb.HO                                AS                  "hoCanBo",
                     cb.TEN                               AS                  "tenCanBo",

                     dv.MA                                AS                  "maDonVi",
                     dv.TEN                               AS                  "tenDonVi",

                     (SELECT DMCV.TEN
                      FROM QT_CHUC_VU QTCV
                               LEFT JOIN DM_CHUC_VU DMCV ON DMCV.MA = QTCV.MA_CHUC_VU
                      WHERE QTCV.SHCC = CB.SHCC
                        AND CHUC_VU_CHINH = 1)            AS                  "tenChucVu",

                     (SELECT QTCV.MA_CHUC_VU
                      FROM QT_CHUC_VU QTCV
                      WHERE QTCV.SHCC = CB.SHCC
                        AND CHUC_VU_CHINH = 1)            AS                  "maChucVu",
                     td.MA                                AS                  "maHocVi",
                     td.TEN                               AS                  "tenHocVi",

                     cdnn.MA                              AS                  "maChucDanhNgheNghiep",
                     cdnn.TEN                             AS                  "tenChucDanhNgheNghiep",
                     ROW_NUMBER() OVER (ORDER BY cb.TEN, cb.HO, NGAY_DI DESC) R
              FROM (SELECT *
                    FROM QT_DI_NUOC_NGOAI
                    WHERE ID IN
                          (SELECT MAX(ID) FROM (SELECT * FROM QT_DI_NUOC_NGOAI ORDER BY SHCC DESC) GROUP BY SHCC)) qtdnn
                       LEFT JOIN TCHC_CAN_BO cb on qtdnn.SHCC = cb.SHCC
                       LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
                       LEFT JOIN DM_TRINH_DO td ON (cb.HOC_VI = td.MA)
                       LEFT JOIN DM_NGACH_CDNN cdnn ON (cdnn.MA = cb.NGACH)
              ORDER BY cb.TEN, cb.HO, NGAY_DI DESC)
        WHERE R BETWEEN (pageNumber - 1) * pageSize + 1 AND pageNumber * pageSize;
    RETURN my_cursor;

END;

/
--EndMethod--

CREATE OR REPLACE FUNCTION QT_DI_NUOC_NGOAI_SEARCH_PAGE(pageNumber IN OUT NUMBER, pageSize IN OUT NUMBER,
                                             filter IN STRING, searchTerm IN STRING,
                                             totalItem OUT NUMBER, pageTotal OUT NUMBER) RETURN SYS_REFCURSOR
AS
    my_cursor        SYS_REFCURSOR;
    sT               STRING(500) := '%' || lower(searchTerm) || '%';
    today            NUMBER(20);
    list_shcc        STRING(100);
    list_dv          STRING(100);
    fromYear         NUMBER;
    toYear           NUMBER;
    timeType         NUMBER;
    loaiHocVi        STRING(100);
    mucDich          STRING(100);
    tinhTrangCongTac NUMBER;
    tinhTrangBaoCao  NUMBER;
BEGIN
    /* Init filter */-------------------------------------------------------------------------------------
    SELECT JSON_VALUE(filter, '$.listDv') INTO list_dv FROM DUAL;
    SELECT JSON_VALUE(filter, '$.listShcc') INTO list_shcc FROM DUAL;
    SELECT JSON_VALUE(filter, '$.fromYear') INTO fromYear FROM DUAL;
    SELECT JSON_VALUE(filter, '$.toYear') INTO toYear FROM DUAL;
    SELECT JSON_VALUE(filter, '$.timeType') INTO timeType FROM DUAL;
    SELECT JSON_VALUE(filter, '$.loaiHocVi') INTO loaiHocVi FROM DUAL;
    SELECT JSON_VALUE(filter, '$.mucDich') INTO mucDich FROM DUAL;
    SELECT JSON_VALUE(filter, '$.tinhTrangCongTac') INTO tinhTrangCongTac FROM DUAL;
    SELECT JSON_VALUE(filter, '$.tinhTrangBaoCao') INTO tinhTrangBaoCao FROM DUAL;

    select (cast(sysdate as date) - cast(to_date('1970-01-01', 'YYYY-MM-DD') as date)) * 86400000 into today from dual;
    SELECT COUNT(*)
    INTO totalItem

    FROM QT_DI_NUOC_NGOAI qtdnn
             LEFT JOIN TCHC_CAN_BO cb on qtdnn.SHCC = cb.SHCC
             LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
             LEFT JOIN DM_MUC_DICH_NUOC_NGOAI DMDNN on qtdnn.MUC_DICH = DMDNN.MA
             LEFT JOIN DM_TRINH_DO td ON (cb.HOC_VI = td.MA)
             LEFT JOIN DM_NGACH_CDNN cdnn ON (cdnn.MA = cb.NGACH)
             LEFT JOIN DM_TIEP_NHAN_VE_NUOC tnvn ON (qtdnn.NOI_DUNG_TIEP_NHAN = tnvn.MA)
    WHERE (((list_shcc IS NULL) AND (list_dv IS NULL) AND (fromYear IS NULL) AND (toYear IS NULL) AND
            (timeType IS NULL) AND (tinhTrangCongTac IS NULL) AND (loaiHocVi IS NULL) AND (mucDich IS NULL) AND
            (tinhTrangBaoCao IS NULL))
        OR (((list_shcc IS NOT NULL AND cb.SHCC IN (SELECT regexp_substr(list_shcc, '[^,]+', 1, level)
                                                    from dual
                                                    connect by regexp_substr(list_shcc, '[^,]+', 1, level) is not null))
            OR (list_dv IS NOT NULL AND cb.MA_DON_VI IN (SELECT regexp_substr(list_dv, '[^,]+', 1, level)
                                                         from dual
                                                         connect by regexp_substr(list_dv, '[^,]+', 1, level) is not null))
            OR (list_shcc IS NULL AND list_dv IS NULL))
            AND (loaiHocVi IS NULL OR cb.HOC_VI IN (SELECT regexp_substr(loaiHocVi, '[^,]+', 1, level)
                                                    from dual
                                                    connect by regexp_substr(loaiHocVi, '[^,]+', 1, level) is not null))
            AND (mucDich IS NULL OR qtdnn.MUC_DICH IN (SELECT regexp_substr(mucDich, '[^,]+', 1, level)
                                                       from dual
                                                       connect by regexp_substr(mucDich, '[^,]+', 1, level) is not null))
            AND (timeType IS NULL OR (
                        timeType = 1 AND
                        (qtdnn.NGAY_DI IS NOT NULL AND (fromYear IS NULL OR qtdnn.NGAY_DI >= fromYear)) AND
                        (toYear IS NULL OR qtdnn.NGAY_DI <= toYear)
                ) OR (
                             timeType = 2
                         AND (qtdnn.NGAY_VE IS NOT NULL AND (fromYear IS NULL OR qtdnn.NGAY_VE >= fromYear))
                         AND (toYear IS NULL OR qtdnn.NGAY_VE <= toYear)
                     ) OR (
                             timeType = 3
                         AND (qtdnn.NGAY_QUYET_DINH IS NOT NULL AND
                              (fromYear IS NULL OR qtdnn.NGAY_QUYET_DINH >= fromYear))
                         AND (toYear IS NULL OR qtdnn.NGAY_QUYET_DINH <= toYear)
                     ) OR (
                             timeType = 4
                         AND (qtdnn.NGAY_QD_TIEP_NHAN IS NOT NULL AND
                              (fromYear IS NULL OR qtdnn.NGAY_QD_TIEP_NHAN >= fromYear))
                         AND (toYear IS NULL OR qtdnn.NGAY_QD_TIEP_NHAN <= toYear)
                     ))
            AND (tinhTrangCongTac IS NULL OR
                 (tinhTrangCongTac = 1 AND qtdnn.NGAY_VE < today and (qtdnn.SO_QD_TIEP_NHAN IS NOT NULL OR
                                                                      TRUNC(1 / 24 / 60 / 60 / 1000 * (qtdnn.NGAY_VE - qtdnn.NGAY_DI)) <
                                                                      30)) OR
                 (tinhTrangCongTac = 2 AND qtdnn.NGAY_VE < today and qtdnn.SO_QD_TIEP_NHAN IS NULL and
                  TRUNC(1 / 24 / 60 / 60 / 1000 * (qtdnn.NGAY_VE - qtdnn.NGAY_DI)) >= 30) OR
                 (tinhTrangCongTac = 3 AND qtdnn.NGAY_VE >= today AND qtdnn.NGAY_DI <= today) OR
                 (tinhTrangCongTac = 4 AND qtdnn.NGAY_DI > today))
            AND (tinhTrangBaoCao IS NULL OR tinhTrangBaoCao = qtdnn.BAO_CAO_TINH_TRANG)
               ))
      AND (searchTerm = ''
        OR LOWER(cb.SHCC) LIKE sT
        OR LOWER(TRIM(cb.HO || ' ' || cb.TEN)) LIKE sT
        OR LOWER(qtdnn.NOI_DUNG) LIKE sT
        OR LOWER(qtdnn.NOI_DUNG_TIEP_NHAN) LIKE sT
        OR LOWER(DMDNN.MO_TA) LIKE sT);

    IF pageNumber < 1 THEN pageNumber := 1; END IF;
    IF pageSize < 1 THEN pageSize := 1; END IF;
    pageTotal := CEIL(totalItem / pageSize);
    pageNumber := LEAST(pageNumber, pageTotal);

    OPEN my_cursor FOR
        SELECT *
        FROM (SELECT qtdnn.ID                                         AS      "id",
                     qtdnn.NOI_DUNG                                   AS      "noiDung",
                     qtdnn.QUOC_GIA                                   AS      "quocGia",
                     qtdnn.SHCC                                       AS      "shcc",
                     qtdnn.MUC_DICH                                   AS      "mucDich",
                     qtdnn.NGAY_DI                                    AS      "ngayDi",
                     qtdnn.NGAY_DI_TYPE                               AS      "ngayDiType",
                     qtdnn.NGAY_VE                                    AS      "ngayVe",
                     qtdnn.NGAY_VE_TYPE                               AS      "ngayVeType",
                     qtdnn.CHI_PHI                                    AS      "chiPhi",
                     qtdnn.GHI_CHU                                    AS      "ghiChu",
                     qtdnn.SO_QUYET_DINH                              AS      "soQuyetDinh",
                     qtdnn.NGAY_QUYET_DINH                            AS      "ngayQuyetDinh",
                     qtdnn.SO_QD_TIEP_NHAN                            AS      "soQdTiepNhan",
                     qtdnn.NOI_DUNG_TIEP_NHAN                         AS      "noiDungTiepNhan",
                     tnvn.TEN                                         AS      "tenNoiDungTiepNhan",
                     qtdnn.NGAY_QD_TIEP_NHAN                          AS      "ngayQdTiepNhan",
                     qtdnn.NGAY_VE_NUOC                               AS      "ngayVeNuoc",
                     qtdnn.BAO_CAO_TINH_TRANG                         AS      "baoCaoTinhTrang",
                     qtdnn.BAO_CAO_TEN                                AS      "baoCaoTen",
                     qtdnn.BAO_CAO_LY_DO_TRA_VE                       AS      "baoCaoLyDoTraVe",

                     (select rtrim(xmlagg(xmlelement(e, dmqg.TEN_QUOC_GIA, ' - ').extract('//text()') order by
                                          null).getclobval(), ' - ')
                      FROM DM_QUOC_GIA dmqg
                      WHERE INSTR(qtdnn.QUOC_GIA, dmqg.MA_CODE) != 0) AS      "danhSachQuocGia",

                     today                                            AS      "today",
                     cb.HO                                            AS      "hoCanBo",
                     cb.TEN                                           AS      "tenCanBo",

                     dv.MA                                            AS      "maDonVi",
                     dv.TEN                                           AS      "tenDonVi",
                     DMDNN.MO_TA                                      AS      "tenMucDich",

                     (SELECT DMCV.TEN
                      FROM QT_CHUC_VU QTCV
                               LEFT JOIN DM_CHUC_VU DMCV ON DMCV.MA = QTCV.MA_CHUC_VU
                      WHERE QTCV.SHCC = CB.SHCC
                        AND CHUC_VU_CHINH = 1)                        AS      "tenChucVu",

                     (SELECT QTCV.MA_CHUC_VU
                      FROM QT_CHUC_VU QTCV
                      WHERE QTCV.SHCC = CB.SHCC
                        AND CHUC_VU_CHINH = 1)                        AS      "maChucVu",

                     td.MA                                            AS      "maHocVi",
                     td.TEN                                           AS      "tenHocVi",

                     cdnn.MA                                          AS      "maChucDanhNgheNghiep",
                     cdnn.TEN                                         AS      "tenChucDanhNgheNghiep",
                     ROW_NUMBER() OVER (ORDER BY cb.TEN, cb.HO, NGAY_DI DESC) R
              FROM QT_DI_NUOC_NGOAI qtdnn
                       LEFT JOIN TCHC_CAN_BO cb on qtdnn.SHCC = cb.SHCC
                       LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
                       LEFT JOIN DM_MUC_DICH_NUOC_NGOAI DMDNN on qtdnn.MUC_DICH = DMDNN.MA
                       LEFT JOIN DM_TRINH_DO td ON (cb.HOC_VI = td.MA)
                       LEFT JOIN DM_NGACH_CDNN cdnn ON (cdnn.MA = cb.NGACH)
                       LEFT JOIN DM_TIEP_NHAN_VE_NUOC tnvn ON (qtdnn.NOI_DUNG_TIEP_NHAN = tnvn.MA)
              WHERE (((list_shcc IS NULL) AND (list_dv IS NULL) AND (fromYear IS NULL) AND (toYear IS NULL) AND
                      (timeType IS NULL) AND (tinhTrangCongTac IS NULL) AND (loaiHocVi IS NULL) AND
                      (mucDich IS NULL) AND (tinhTrangBaoCao IS NULL))
                  OR (((list_shcc IS NOT NULL AND cb.SHCC IN (SELECT regexp_substr(list_shcc, '[^,]+', 1, level)
                                                              from dual
                                                              connect by regexp_substr(list_shcc, '[^,]+', 1, level) is not null))
                      OR (list_dv IS NOT NULL AND cb.MA_DON_VI IN (SELECT regexp_substr(list_dv, '[^,]+', 1, level)
                                                                   from dual
                                                                   connect by regexp_substr(list_dv, '[^,]+', 1, level) is not null))
                      OR (list_shcc IS NULL AND list_dv IS NULL))
                      AND (loaiHocVi IS NULL OR cb.HOC_VI IN (SELECT regexp_substr(loaiHocVi, '[^,]+', 1, level)
                                                              from dual
                                                              connect by regexp_substr(loaiHocVi, '[^,]+', 1, level) is not null))
                      AND (mucDich IS NULL OR qtdnn.MUC_DICH IN (SELECT regexp_substr(mucDich, '[^,]+', 1, level)
                                                                 from dual
                                                                 connect by regexp_substr(mucDich, '[^,]+', 1, level) is not null))
                      AND (timeType IS NULL OR (
                                  timeType = 1 AND
                                  (qtdnn.NGAY_DI IS NOT NULL AND (fromYear IS NULL OR qtdnn.NGAY_DI >= fromYear)) AND
                                  (toYear IS NULL OR qtdnn.NGAY_DI <= toYear)
                          ) OR (
                                       timeType = 2
                                   AND (qtdnn.NGAY_VE IS NOT NULL AND (fromYear IS NULL OR qtdnn.NGAY_VE >= fromYear))
                                   AND (toYear IS NULL OR qtdnn.NGAY_VE <= toYear)
                               ) OR (
                                       timeType = 3
                                   AND (qtdnn.NGAY_QUYET_DINH IS NOT NULL AND
                                        (fromYear IS NULL OR qtdnn.NGAY_QUYET_DINH >= fromYear))
                                   AND (toYear IS NULL OR qtdnn.NGAY_QUYET_DINH <= toYear)
                               ) OR (
                                       timeType = 4
                                   AND (qtdnn.NGAY_QD_TIEP_NHAN IS NOT NULL AND
                                        (fromYear IS NULL OR qtdnn.NGAY_QD_TIEP_NHAN >= fromYear))
                                   AND (toYear IS NULL OR qtdnn.NGAY_QD_TIEP_NHAN <= toYear)
                               ))
                      AND (tinhTrangCongTac IS NULL OR
                           (tinhTrangCongTac = 1 AND qtdnn.NGAY_VE < today and (qtdnn.SO_QD_TIEP_NHAN IS NOT NULL OR
                                                                                TRUNC(1 / 24 / 60 / 60 / 1000 * (qtdnn.NGAY_VE - qtdnn.NGAY_DI)) <
                                                                                30)) OR
                           (tinhTrangCongTac = 2 AND qtdnn.NGAY_VE < today and qtdnn.SO_QD_TIEP_NHAN IS NULL and
                            TRUNC(1 / 24 / 60 / 60 / 1000 * (qtdnn.NGAY_VE - qtdnn.NGAY_DI)) >= 30) OR
                           (tinhTrangCongTac = 3 AND qtdnn.NGAY_VE >= today AND qtdnn.NGAY_DI <= today) OR
                           (tinhTrangCongTac = 4 AND qtdnn.NGAY_DI > today))
                      AND (tinhTrangBaoCao IS NULL OR tinhTrangBaoCao = qtdnn.BAO_CAO_TINH_TRANG)
                         ))
                AND (searchTerm = ''
                  OR LOWER(cb.SHCC) LIKE sT
                  OR LOWER(TRIM(cb.HO || ' ' || cb.TEN)) LIKE sT
                  OR LOWER(qtdnn.NOI_DUNG) LIKE sT
                  OR LOWER(qtdnn.NOI_DUNG_TIEP_NHAN) LIKE sT
                  OR LOWER(DMDNN.MO_TA) LIKE sT)
              ORDER BY cb.TEN, cb.HO, NGAY_DI DESC)
        WHERE R BETWEEN (pageNumber - 1) * pageSize + 1 AND pageNumber * pageSize;
    RETURN my_cursor;

END;

/
--EndMethod--

CREATE OR REPLACE FUNCTION QT_GIAI_THUONG_GROUP_PAGE(pageNumber IN OUT NUMBER, pageSize IN OUT NUMBER,
                                          list_shcc IN STRING, list_dv IN STRING,
                                          fromYear IN NUMBER, toYear IN NUMBER, searchTerm IN STRING,
                                          totalItem OUT NUMBER, pageTotal OUT NUMBER) RETURN SYS_REFCURSOR
AS
    my_cursor SYS_REFCURSOR;
    sT        STRING(500) := '%' || lower(searchTerm) || '%';
BEGIN
    SELECT COUNT(*)
    INTO totalItem

    FROM (SELECT *
          FROM QT_GIAI_THUONG
          WHERE ID IN (SELECT MAX(ID) FROM (SELECT * FROM QT_GIAI_THUONG ORDER BY SHCC DESC) GROUP BY SHCC)) qtgt
             LEFT JOIN TCHC_CAN_BO cb on qtgt.SHCC = cb.SHCC
             LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
             LEFT JOIN DM_TRINH_DO td ON (cb.HOC_VI = td.MA)
             LEFT JOIN DM_NGACH_CDNN cdnn ON (cdnn.MA = cb.NGACH);

    IF pageNumber < 1 THEN pageNumber := 1; END IF;
    IF pageSize < 1 THEN pageSize := 1; END IF;
    pageTotal := CEIL(totalItem / pageSize);
    pageNumber := LEAST(pageNumber, pageTotal);

    OPEN my_cursor FOR
        SELECT *
        FROM (SELECT qtgt.ID                                    AS "id",
                     qtgt.SHCC                                  AS "shcc",

                     (SELECT COUNT(*)
                      FROM QT_GIAI_THUONG qtgt_temp
                               LEFT JOIN TCHC_CAN_BO cb on qtgt_temp.SHCC = cb.SHCC
                               LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
                      WHERE (qtgt_temp.SHCC = qtgt.SHCC)
                        AND (((list_shcc IS NULL) AND (list_dv IS NULL) AND (fromYear IS NULL) AND (toYear IS NULL))
                          OR (((list_shcc IS NOT NULL AND cb.SHCC IN (SELECT regexp_substr(list_shcc, '[^,]+', 1, level)
                                                                      from dual
                                                                      connect by regexp_substr(list_shcc, '[^,]+', 1, level) is not null))
                              OR (list_dv IS NOT NULL AND
                                  cb.MA_DON_VI IN (SELECT regexp_substr(list_dv, '[^,]+', 1, level)
                                                   from dual
                                                   connect by regexp_substr(list_dv, '[^,]+', 1, level) is not null))
                              OR (list_shcc IS NULL AND list_dv IS NULL))
                              AND
                              (qtgt_temp.NAM_CAP IS NOT NULL AND (fromYear IS NULL OR qtgt_temp.NAM_CAP >= fromYear))
                              AND (qtgt_temp.NAM_CAP IS NOT NULL AND (toYear IS NULL OR qtgt_temp.NAM_CAP <= toYear))))
                        AND (searchTerm = ''
                          OR LOWER(cb.SHCC) LIKE sT
                          OR LOWER(TRIM(cb.HO || ' ' || cb.TEN)) LIKE sT
                          OR LOWER(qtgt_temp.NOI_DUNG) LIKE sT
                          OR LOWER(qtgt_temp.TEN_GIAI_THUONG) LIKE sT
                          OR LOWER(qtgt_temp.SO_QUYET_DINH) LIKE sT
                          OR LOWER(qtgt_temp.NOI_CAP) LIKE sT)) AS "soGiaiThuong",

                     (select rtrim(xmlagg(xmlelement(e, qtgt_temp.TEN_GIAI_THUONG || ' ', '??').extract('//text()')
                                          order by null).getclobval(), '??')
                      FROM QT_GIAI_THUONG qtgt_temp
                               LEFT JOIN TCHC_CAN_BO cb on qtgt_temp.SHCC = cb.SHCC
                               LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
                      WHERE (qtgt_temp.SHCC = qtgt.SHCC)
                        AND (((list_shcc IS NULL) AND (list_dv IS NULL) AND (fromYear IS NULL) AND (toYear IS NULL))
                          OR (((list_shcc IS NOT NULL AND cb.SHCC IN (SELECT regexp_substr(list_shcc, '[^,]+', 1, level)
                                                                      from dual
                                                                      connect by regexp_substr(list_shcc, '[^,]+', 1, level) is not null))
                              OR (list_dv IS NOT NULL AND
                                  cb.MA_DON_VI IN (SELECT regexp_substr(list_dv, '[^,]+', 1, level)
                                                   from dual
                                                   connect by regexp_substr(list_dv, '[^,]+', 1, level) is not null))
                              OR (list_shcc IS NULL AND list_dv IS NULL))
                              AND
                              (qtgt_temp.NAM_CAP IS NOT NULL AND (fromYear IS NULL OR qtgt_temp.NAM_CAP >= fromYear))
                              AND (qtgt_temp.NAM_CAP IS NOT NULL AND (toYear IS NULL OR qtgt_temp.NAM_CAP <= toYear))))
                        AND (searchTerm = ''
                          OR LOWER(cb.SHCC) LIKE sT
                          OR LOWER(TRIM(cb.HO || ' ' || cb.TEN)) LIKE sT
                          OR LOWER(qtgt_temp.NOI_DUNG) LIKE sT
                          OR LOWER(qtgt_temp.TEN_GIAI_THUONG) LIKE sT
                          OR LOWER(qtgt_temp.SO_QUYET_DINH) LIKE sT
                          OR LOWER(qtgt_temp.NOI_CAP) LIKE sT)) AS "danhSachGiaiThuong",

                     (select rtrim(xmlagg(xmlelement(e, qtgt_temp.NAM_CAP || ' ', '??').extract('//text()') order by
                                          null).getclobval(), '??')
                      FROM QT_GIAI_THUONG qtgt_temp
                               LEFT JOIN TCHC_CAN_BO cb on qtgt_temp.SHCC = cb.SHCC
                               LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
                      WHERE (qtgt_temp.SHCC = qtgt.SHCC)
                        AND (((list_shcc IS NULL) AND (list_dv IS NULL) AND (fromYear IS NULL) AND (toYear IS NULL))
                          OR (((list_shcc IS NOT NULL AND cb.SHCC IN (SELECT regexp_substr(list_shcc, '[^,]+', 1, level)
                                                                      from dual
                                                                      connect by regexp_substr(list_shcc, '[^,]+', 1, level) is not null))
                              OR (list_dv IS NOT NULL AND
                                  cb.MA_DON_VI IN (SELECT regexp_substr(list_dv, '[^,]+', 1, level)
                                                   from dual
                                                   connect by regexp_substr(list_dv, '[^,]+', 1, level) is not null))
                              OR (list_shcc IS NULL AND list_dv IS NULL))
                              AND
                              (qtgt_temp.NAM_CAP IS NOT NULL AND (fromYear IS NULL OR qtgt_temp.NAM_CAP >= fromYear))
                              AND (qtgt_temp.NAM_CAP IS NOT NULL AND (toYear IS NULL OR qtgt_temp.NAM_CAP <= toYear))))
                        AND (searchTerm = ''
                          OR LOWER(cb.SHCC) LIKE sT
                          OR LOWER(TRIM(cb.HO || ' ' || cb.TEN)) LIKE sT
                          OR LOWER(qtgt_temp.NOI_DUNG) LIKE sT
                          OR LOWER(qtgt_temp.TEN_GIAI_THUONG) LIKE sT
                          OR LOWER(qtgt_temp.SO_QUYET_DINH) LIKE sT
                          OR LOWER(qtgt_temp.NOI_CAP) LIKE sT)) AS "danhSachNamCap",

                     cb.HO                                      AS "hoCanBo",
                     cb.TEN                                     AS "tenCanBo",

                     dv.MA                                      AS "maDonVi",
                     dv.TEN                                     AS "tenDonVi",
                     (SELECT DMCV.TEN
                      FROM QT_CHUC_VU QTCV
                               LEFT JOIN DM_CHUC_VU DMCV ON DMCV.MA = QTCV.MA_CHUC_VU
                      WHERE QTCV.SHCC = CB.SHCC
                        AND CHUC_VU_CHINH = 1)                  AS "tenChucVu",

                     (SELECT QTCV.MA_CHUC_VU
                      FROM QT_CHUC_VU QTCV
                      WHERE QTCV.SHCC = CB.SHCC
                        AND CHUC_VU_CHINH = 1)                  AS "maChucVu",

                     td.MA                                      AS "maHocVi",
                     td.TEN                                     AS "tenHocVi",

                     cdnn.MA                                    AS "maChucDanhNgheNghiep",
                     cdnn.TEN                                   AS "tenChucDanhNgheNghiep",

                     ROW_NUMBER() OVER (ORDER BY NAM_CAP DESC)     R
              FROM (SELECT *
                    FROM QT_GIAI_THUONG
                    WHERE ID IN
                          (SELECT MAX(ID) FROM (SELECT * FROM QT_GIAI_THUONG ORDER BY SHCC DESC) GROUP BY SHCC)) qtgt
                       LEFT JOIN TCHC_CAN_BO cb on qtgt.SHCC = cb.SHCC
                       LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
                       LEFT JOIN DM_TRINH_DO td ON (cb.HOC_VI = td.MA)
                       LEFT JOIN DM_NGACH_CDNN cdnn ON (cdnn.MA = cb.NGACH)
              ORDER BY qtgt.NAM_CAP DESC)
        WHERE R BETWEEN (pageNumber - 1) * pageSize + 1 AND pageNumber * pageSize;
    RETURN my_cursor;

END;

/
--EndMethod--

CREATE OR REPLACE FUNCTION QT_GIAI_THUONG_SEARCH_PAGE(pageNumber IN OUT NUMBER, pageSize IN OUT NUMBER,
                                           list_shcc IN STRING, list_dv IN STRING,
                                           fromYear IN NUMBER, toYear IN NUMBER, searchTerm IN STRING,
                                           totalItem OUT NUMBER, pageTotal OUT NUMBER) RETURN SYS_REFCURSOR
AS
    my_cursor SYS_REFCURSOR;
    sT        STRING(500) := '%' || lower(searchTerm) || '%';
BEGIN
    SELECT COUNT(*)
    INTO totalItem

    FROM QT_GIAI_THUONG qtgt
             LEFT JOIN TCHC_CAN_BO cb on qtgt.SHCC = cb.SHCC
             LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
             LEFT JOIN DM_TRINH_DO td ON (cb.HOC_VI = td.MA)
             LEFT JOIN DM_NGACH_CDNN cdnn ON (cdnn.MA = cb.NGACH)
    WHERE (((list_shcc IS NULL) AND (list_dv IS NULL) AND (fromYear IS NULL) AND (toYear IS NULL))
        OR (((list_shcc IS NOT NULL AND cb.SHCC IN (SELECT regexp_substr(list_shcc, '[^,]+', 1, level)
                                                    from dual
                                                    connect by regexp_substr(list_shcc, '[^,]+', 1, level) is not null))
            OR (list_dv IS NOT NULL AND cb.MA_DON_VI IN (SELECT regexp_substr(list_dv, '[^,]+', 1, level)
                                                         from dual
                                                         connect by regexp_substr(list_dv, '[^,]+', 1, level) is not null))
            OR (list_shcc IS NULL AND list_dv IS NULL))
            AND (qtgt.NAM_CAP IS NOT NULL AND (fromYear IS NULL OR qtgt.NAM_CAP >= fromYear))
            AND (qtgt.NAM_CAP IS NOT NULL AND (toYear IS NULL OR qtgt.NAM_CAP <= toYear))))
      AND (searchTerm = ''
        OR LOWER(cb.SHCC) LIKE sT
        OR LOWER(TRIM(cb.HO || ' ' || cb.TEN)) LIKE sT
        OR LOWER(qtgt.NOI_DUNG) LIKE sT
        OR LOWER(qtgt.TEN_GIAI_THUONG) LIKE sT
        OR LOWER(qtgt.SO_QUYET_DINH) LIKE sT
        OR LOWER(qtgt.NOI_CAP) LIKE sT);

    IF pageNumber < 1 THEN pageNumber := 1; END IF;
    IF pageSize < 1 THEN pageSize := 1; END IF;
    pageTotal := CEIL(totalItem / pageSize);
    pageNumber := LEAST(pageNumber, pageTotal);

    OPEN my_cursor FOR
        SELECT *
        FROM (SELECT qtgt.ID                   AS              "id",
                     qtgt.TEN_GIAI_THUONG      AS              "tenGiaiThuong",
                     qtgt.NOI_DUNG             AS              "noiDung",
                     qtgt.NOI_CAP              AS              "noiCap",
                     qtgt.NAM_CAP              AS              "namCap",
                     qtgt.SHCC                 AS              "shcc",
                     qtgt.SO_QUYET_DINH        AS              "soQuyetDinh",

                     cb.HO                     AS              "hoCanBo",
                     cb.TEN                    AS              "tenCanBo",

                     dv.MA                     AS              "maDonVi",
                     dv.TEN                    AS              "tenDonVi",
                     (SELECT DMCV.TEN
                      FROM QT_CHUC_VU QTCV
                               LEFT JOIN DM_CHUC_VU DMCV ON DMCV.MA = QTCV.MA_CHUC_VU
                      WHERE QTCV.SHCC = CB.SHCC
                        AND CHUC_VU_CHINH = 1) AS              "tenChucVu",

                     (SELECT QTCV.MA_CHUC_VU
                      FROM QT_CHUC_VU QTCV
                      WHERE QTCV.SHCC = CB.SHCC
                        AND CHUC_VU_CHINH = 1) AS              "maChucVu",

                     td.MA                     AS              "maHocVi",
                     td.TEN                    AS              "tenHocVi",

                     cdnn.MA                   AS              "maChucDanhNgheNghiep",
                     cdnn.TEN                  AS              "tenChucDanhNgheNghiep",
                     ROW_NUMBER() OVER (ORDER BY NAM_CAP DESC) R
              FROM QT_GIAI_THUONG qtgt
                       LEFT JOIN TCHC_CAN_BO cb on qtgt.SHCC = cb.SHCC
                       LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
                       LEFT JOIN DM_TRINH_DO td ON (cb.HOC_VI = td.MA)
                       LEFT JOIN DM_NGACH_CDNN cdnn ON (cdnn.MA = cb.NGACH)
              WHERE (((list_shcc IS NULL) AND (list_dv IS NULL) AND (fromYear IS NULL) AND (toYear IS NULL))
                  OR (((list_shcc IS NOT NULL AND cb.SHCC IN (SELECT regexp_substr(list_shcc, '[^,]+', 1, level)
                                                              from dual
                                                              connect by regexp_substr(list_shcc, '[^,]+', 1, level) is not null))
                      OR (list_dv IS NOT NULL AND cb.MA_DON_VI IN (SELECT regexp_substr(list_dv, '[^,]+', 1, level)
                                                                   from dual
                                                                   connect by regexp_substr(list_dv, '[^,]+', 1, level) is not null))
                      OR (list_shcc IS NULL AND list_dv IS NULL))
                      AND (qtgt.NAM_CAP IS NOT NULL AND (fromYear IS NULL OR qtgt.NAM_CAP >= fromYear))
                      AND (qtgt.NAM_CAP IS NOT NULL AND (toYear IS NULL OR qtgt.NAM_CAP <= toYear))))
                AND (searchTerm = ''
                  OR LOWER(cb.SHCC) LIKE sT
                  OR LOWER(TRIM(cb.HO || ' ' || cb.TEN)) LIKE sT
                  OR LOWER(qtgt.NOI_DUNG) LIKE sT
                  OR LOWER(qtgt.TEN_GIAI_THUONG) LIKE sT
                  OR LOWER(qtgt.SO_QUYET_DINH) LIKE sT
                  OR LOWER(qtgt.NOI_CAP) LIKE sT)
              ORDER BY qtgt.NAM_CAP DESC)
        WHERE R BETWEEN (pageNumber - 1) * pageSize + 1 AND pageNumber * pageSize;
    RETURN my_cursor;

END;

/
--EndMethod--

CREATE OR REPLACE FUNCTION QT_HOC_TAP_CONG_TAC_GROUP_PAGE(pageNumber IN OUT NUMBER, pageSize IN OUT NUMBER,
                                               list_shcc IN STRING, list_dv IN STRING,
                                               fromYear IN NUMBER, toYear IN NUMBER, timeType IN NUMBER,
                                               tinhTrang IN NUMBER, searchTerm IN STRING,
                                               totalItem OUT NUMBER, pageTotal OUT NUMBER) RETURN SYS_REFCURSOR
AS
    my_cursor SYS_REFCURSOR;
    ST        STRING(500) := '%' || lower(searchTerm) || '%';
    today     NUMBER;
BEGIN
    select (cast(sysdate as date) - cast(to_date('1970-01-01', 'YYYY-MM-DD') as date)) * 86400000 into today from dual;
    SELECT COUNT(*)
    INTO totalItem
    FROM (SELECT *
          FROM QT_HOC_TAP_CONG_TAC
          WHERE ID IN (SELECT MAX(ID) FROM (SELECT * FROM QT_HOC_TAP_CONG_TAC ORDER BY SHCC DESC) GROUP BY SHCC)) htct
             LEFT JOIN TCHC_CAN_BO cb on htct.SHCC = cb.SHCC
             LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
             LEFT JOIN DM_TRINH_DO td ON (cb.HOC_VI = td.MA)
             LEFT JOIN DM_NGACH_CDNN cdnn ON (cdnn.MA = cb.NGACH);

    IF pageNumber < 1 THEN pageNumber := 1; END IF;
    IF pageSize < 1 THEN pageSize := 1; END IF;
    pageTotal := CEIL(totalItem / pageSize);
    pageNumber := LEAST(pageNumber, pageTotal);

    OPEN my_cursor FOR
        SELECT *
        FROM (SELECT htct.ID                                     as "id",
                     htct.SHCC                                   as "shcc",

                     (SELECT COUNT(*)
                      FROM QT_HOC_TAP_CONG_TAC htct_temp
                               LEFT JOIN TCHC_CAN_BO cb on htct_temp.SHCC = cb.SHCC
                               LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
                      WHERE (htct_temp.SHCC = htct.SHCC)
                        AND (((list_shcc IS NULL) AND (list_dv IS NULL) AND (fromYear IS NULL) AND (toYear IS NULL) AND
                              (timeType = 0) AND (tinhTrang IS NULL))
                          OR (((list_shcc IS NOT NULL AND cb.SHCC IN (SELECT regexp_substr(list_shcc, '[^,]+', 1, level)
                                                                      from dual
                                                                      connect by regexp_substr(list_shcc, '[^,]+', 1, level) is not null))
                              OR (list_dv IS NOT NULL AND
                                  cb.MA_DON_VI IN (SELECT regexp_substr(list_dv, '[^,]+', 1, level)
                                                   from dual
                                                   connect by regexp_substr(list_dv, '[^,]+', 1, level) is not null))
                              OR (list_shcc IS NULL AND list_dv IS NULL))
                              AND (timeType = 0 OR (
                                          timeType = 1 AND (htct_temp.BAT_DAU IS NOT NULL AND
                                                            (fromYear IS NULL OR htct_temp.BAT_DAU >= fromYear)) AND
                                          (toYear IS NULL OR htct_temp.BAT_DAU <= toYear)
                                  ))
                              AND (tinhTrang IS NULL OR
                                   ((htct_temp.KET_THUC = -1 OR htct_temp.KET_THUC >= today) AND tinhTrang = 2) OR
                                   (htct_temp.KET_THUC IS NOT NULL AND htct_temp.KET_THUC != -1 AND
                                    htct_temp.KET_THUC < today AND tinhTrang = 1))))
                        AND (searchTerm = ''
                          OR LOWER(cb.SHCC) LIKE ST
                          OR LOWER(TRIM(cb.HO || ' ' || cb.TEN)) LIKE ST
                          OR LOWER(htct_temp.NOI_DUNG) LIKE ST)) AS "soNoiDung",

                     (select rtrim(xmlagg(xmlelement(e, htct_temp.NOI_DUNG || ' ', '??').extract('//text()') order by
                                          null).getclobval(), '??')
                      FROM QT_HOC_TAP_CONG_TAC htct_temp
                               LEFT JOIN TCHC_CAN_BO cb on htct_temp.SHCC = cb.SHCC
                               LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
                      WHERE (htct_temp.SHCC = htct.SHCC)
                        AND (((list_shcc IS NULL) AND (list_dv IS NULL) AND (fromYear IS NULL) AND (toYear IS NULL) AND
                              (timeType = 0) AND (tinhTrang IS NULL))
                          OR (((list_shcc IS NOT NULL AND cb.SHCC IN (SELECT regexp_substr(list_shcc, '[^,]+', 1, level)
                                                                      from dual
                                                                      connect by regexp_substr(list_shcc, '[^,]+', 1, level) is not null))
                              OR (list_dv IS NOT NULL AND
                                  cb.MA_DON_VI IN (SELECT regexp_substr(list_dv, '[^,]+', 1, level)
                                                   from dual
                                                   connect by regexp_substr(list_dv, '[^,]+', 1, level) is not null))
                              OR (list_shcc IS NULL AND list_dv IS NULL))
                              AND (timeType = 0 OR (
                                          timeType = 1 AND (htct_temp.BAT_DAU IS NOT NULL AND
                                                            (fromYear IS NULL OR htct_temp.BAT_DAU >= fromYear)) AND
                                          (toYear IS NULL OR htct_temp.BAT_DAU <= toYear)
                                  ))
                              AND (tinhTrang IS NULL OR
                                   ((htct_temp.KET_THUC = -1 OR htct_temp.KET_THUC >= today) AND tinhTrang = 2) OR
                                   (htct_temp.KET_THUC IS NOT NULL AND htct_temp.KET_THUC != -1 AND
                                    htct_temp.KET_THUC < today AND tinhTrang = 1))))
                        AND (searchTerm = ''
                          OR LOWER(cb.SHCC) LIKE ST
                          OR LOWER(TRIM(cb.HO || ' ' || cb.TEN)) LIKE ST
                          OR LOWER(htct_temp.NOI_DUNG) LIKE ST)) AS "danhSachNoiDung",

                     cb.TEN                                      as "tenCanBo",
                     cb.HO                                       as "hoCanBo",

                     dv.MA                                       AS "maDonVi",
                     dv.TEN                                      AS "tenDonVi",
                     (SELECT DMCV.TEN
                      FROM QT_CHUC_VU QTCV
                               LEFT JOIN DM_CHUC_VU DMCV ON DMCV.MA = QTCV.MA_CHUC_VU
                      WHERE QTCV.SHCC = CB.SHCC
                        AND CHUC_VU_CHINH = 1)                   AS "tenChucVu",

                     (SELECT QTCV.MA_CHUC_VU
                      FROM QT_CHUC_VU QTCV
                      WHERE QTCV.SHCC = CB.SHCC
                        AND CHUC_VU_CHINH = 1)                   AS "maChucVu",

                     td.MA                                       AS "maHocVi",
                     td.TEN                                      AS "tenHocVi",

                     cdnn.MA                                     AS "maChucDanhNgheNghiep",
                     cdnn.TEN                                    AS "tenChucDanhNgheNghiep",

                     ROW_NUMBER() OVER (ORDER BY htct.BAT_DAU ASC)  R
              FROM (SELECT *
                    FROM QT_HOC_TAP_CONG_TAC
                    WHERE ID IN (SELECT MAX(ID)
                                 FROM (SELECT * FROM QT_HOC_TAP_CONG_TAC ORDER BY SHCC DESC)
                                 GROUP BY SHCC)) htct
                       LEFT JOIN TCHC_CAN_BO cb on htct.SHCC = cb.SHCC
                       LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
                       LEFT JOIN DM_TRINH_DO td ON (cb.HOC_VI = td.MA)
                       LEFT JOIN DM_NGACH_CDNN cdnn ON (cdnn.MA = cb.NGACH)
              ORDER BY htct.BAT_DAU ASC)
        WHERE R BETWEEN (pageNumber - 1) * pageSize + 1 AND pageNumber * pageSize;
    RETURN my_cursor;

END;

/
--EndMethod--

CREATE OR REPLACE FUNCTION QT_HOC_TAP_CONG_TAC_SEARCH_PAGE(pageNumber IN OUT NUMBER, pageSize IN OUT NUMBER,
                                                list_shcc IN STRING, list_dv IN STRING,
                                                fromYear IN NUMBER, toYear IN NUMBER, timeType IN NUMBER,
                                                tinhTrang IN NUMBER, searchTerm IN STRING,
                                                totalItem OUT NUMBER, pageTotal OUT NUMBER) RETURN SYS_REFCURSOR
AS
    my_cursor SYS_REFCURSOR;
    ST        STRING(500) := '%' || lower(searchTerm) || '%';
    today     NUMBER;
BEGIN
    select (cast(sysdate as date) - cast(to_date('1970-01-01', 'YYYY-MM-DD') as date)) * 86400000 into today from dual;
    SELECT COUNT(*)
    INTO totalItem

    FROM QT_HOC_TAP_CONG_TAC htct
             LEFT JOIN TCHC_CAN_BO cb on htct.SHCC = cb.SHCC
             LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
             LEFT JOIN DM_TRINH_DO td ON (cb.HOC_VI = td.MA)
             LEFT JOIN DM_NGACH_CDNN cdnn ON (cdnn.MA = cb.NGACH)
    WHERE (((list_shcc IS NULL) AND (list_dv IS NULL) AND (fromYear IS NULL) AND (toYear IS NULL) AND (timeType = 0) AND
            (tinhTrang IS NULL))
        OR (((list_shcc IS NOT NULL AND cb.SHCC IN (SELECT regexp_substr(list_shcc, '[^,]+', 1, level)
                                                    from dual
                                                    connect by regexp_substr(list_shcc, '[^,]+', 1, level) is not null))
            OR (list_dv IS NOT NULL AND cb.MA_DON_VI IN (SELECT regexp_substr(list_dv, '[^,]+', 1, level)
                                                         from dual
                                                         connect by regexp_substr(list_dv, '[^,]+', 1, level) is not null))
            OR (list_shcc IS NULL AND list_dv IS NULL))
            AND (timeType = 0 OR (
                        timeType = 1 AND
                        (htct.BAT_DAU IS NOT NULL AND (fromYear IS NULL OR htct.BAT_DAU >= fromYear)) AND
                        (toYear IS NULL OR htct.BAT_DAU <= toYear)
                ))
            AND (tinhTrang IS NULL OR ((htct.KET_THUC = -1 OR htct.KET_THUC >= today) AND tinhTrang = 2) OR
                 (htct.KET_THUC IS NOT NULL AND htct.KET_THUC != -1 AND htct.KET_THUC < today AND tinhTrang = 1))))
      AND (searchTerm = ''
        OR LOWER(cb.SHCC) LIKE ST
        OR LOWER(TRIM(cb.HO || ' ' || cb.TEN)) LIKE ST
        OR LOWER(htct.NOI_DUNG) LIKE ST);

    IF pageNumber < 1 THEN pageNumber := 1; END IF;
    IF pageSize < 1 THEN pageSize := 1; END IF;
    pageTotal := CEIL(totalItem / pageSize);
    pageNumber := LEAST(pageNumber, pageTotal);

    OPEN my_cursor FOR
        SELECT *
        FROM (SELECT htct.ID                   as                   "id",
                     htct.SHCC                 as                   "shcc",
                     htct.BAT_DAU              as                   "batDau",
                     htct.KET_THUC             as                   "ketThuc",
                     htct.NOI_DUNG             as                   "noiDung",
                     htct.BAT_DAU_TYPE         as                   "batDauType",
                     htct.KET_THUC_TYPE        as                   "ketThucType",

                     today                     as                   "today",
                     cb.TEN                    as                   "tenCanBo",
                     cb.HO                     as                   "hoCanBo",
                     dv.MA                     AS                   "maDonVi",
                     dv.TEN                    AS                   "tenDonVi",
                     (SELECT DMCV.TEN
                      FROM QT_CHUC_VU QTCV
                               LEFT JOIN DM_CHUC_VU DMCV ON DMCV.MA = QTCV.MA_CHUC_VU
                      WHERE QTCV.SHCC = CB.SHCC
                        AND CHUC_VU_CHINH = 1) AS                   "tenChucVu",

                     (SELECT QTCV.MA_CHUC_VU
                      FROM QT_CHUC_VU QTCV
                      WHERE QTCV.SHCC = CB.SHCC
                        AND CHUC_VU_CHINH = 1) AS                   "maChucVu",

                     td.MA                     AS                   "maHocVi",
                     td.TEN                    AS                   "tenHocVi",

                     cdnn.MA                   AS                   "maChucDanhNgheNghiep",
                     cdnn.TEN                  AS                   "tenChucDanhNgheNghiep",

                     ROW_NUMBER() OVER (ORDER BY htct.BAT_DAU DESC) R
              FROM QT_HOC_TAP_CONG_TAC htct
                       LEFT JOIN TCHC_CAN_BO cb on htct.SHCC = cb.SHCC
                       LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
                       LEFT JOIN DM_TRINH_DO td ON (cb.HOC_VI = td.MA)
                       LEFT JOIN DM_NGACH_CDNN cdnn ON (cdnn.MA = cb.NGACH)
              WHERE (((list_shcc IS NULL) AND (list_dv IS NULL) AND (fromYear IS NULL) AND (toYear IS NULL) AND
                      (timeType = 0) AND (tinhTrang IS NULL))
                  OR (((list_shcc IS NOT NULL AND cb.SHCC IN (SELECT regexp_substr(list_shcc, '[^,]+', 1, level)
                                                              from dual
                                                              connect by regexp_substr(list_shcc, '[^,]+', 1, level) is not null))
                      OR (list_dv IS NOT NULL AND cb.MA_DON_VI IN (SELECT regexp_substr(list_dv, '[^,]+', 1, level)
                                                                   from dual
                                                                   connect by regexp_substr(list_dv, '[^,]+', 1, level) is not null))
                      OR (list_shcc IS NULL AND list_dv IS NULL))
                      AND (timeType = 0 OR (
                                  timeType = 1 AND
                                  (htct.BAT_DAU IS NOT NULL AND (fromYear IS NULL OR htct.BAT_DAU >= fromYear)) AND
                                  (toYear IS NULL OR htct.BAT_DAU <= toYear)
                          ))
                      AND (tinhTrang IS NULL OR ((htct.KET_THUC = -1 OR htct.KET_THUC >= today) AND tinhTrang = 2) OR
                           (htct.KET_THUC IS NOT NULL AND htct.KET_THUC != -1 AND htct.KET_THUC < today AND
                            tinhTrang = 1))))
                AND (searchTerm = ''
                  OR LOWER(cb.SHCC) LIKE ST
                  OR LOWER(TRIM(cb.HO || ' ' || cb.TEN)) LIKE ST
                  OR LOWER(htct.NOI_DUNG) LIKE ST)
              ORDER BY htct.BAT_DAU DESC)
        WHERE R BETWEEN (pageNumber - 1) * pageSize + 1 AND pageNumber * pageSize;
    RETURN my_cursor;

END;

/
--EndMethod--

CREATE OR REPLACE FUNCTION QT_HOP_DONG_DON_VI_TRA_LUONG_GROUP_PAGE(pageNumber IN OUT NUMBER, pageSize IN OUT NUMBER,
                                                list_shcc IN STRING, list_dv IN STRING,
                                                fromYear IN NUMBER, toYear IN NUMBER, searchTerm IN STRING,
                                                totalItem OUT NUMBER, pageTotal OUT NUMBER) RETURN SYS_REFCURSOR
AS
    my_cursor SYS_REFCURSOR;
    sT        STRING(500) := '%' || lower(searchTerm) || '%';
BEGIN
    SELECT COUNT(*)
    INTO totalItem
    FROM (SELECT *
          FROM QT_HOP_DONG_DON_VI_TRA_LUONG
          WHERE ID IN
                (SELECT MAX(ID) FROM (SELECT * FROM QT_HOP_DONG_DON_VI_TRA_LUONG ORDER BY ID DESC) GROUP BY SHCC)) hd
             LEFT JOIN TCHC_CAN_BO benA on hd.SHCC = benA.SHCC
             LEFT JOIN TCHC_CAN_BO nguoiKy on hd.NGUOI_KY = nguoiKy.SHCC;
    pageTotal := CEIL(totalItem / pageSize);
    pageNumber := LEAST(pageNumber, pageTotal);
    IF pageNumber < 1 THEN pageNumber := 1; END IF;
    IF pageSize < 1 THEN pageSize := 1; END IF;

    OPEN my_cursor FOR
        SELECT *
        FROM (
                 SELECT hd.SHCC AS                   "shcc",
                        hd.ID              AS                   "id",
                        benA.HO            AS                   "hoBenA",
                        benA.TEN           AS                   "tenBenA",
                        (SELECT COUNT(*)
                        FROM QT_HOP_DONG_DON_VI_TRA_LUONG hd_temp
                                 LEFT JOIN TCHC_CAN_BO nguoiKy on hd_temp.NGUOI_KY = nguoiKy.SHCC
                                 LEFT JOIN DM_LOAI_HOP_DONG dhd ON hd_temp.LOAI_HOP_DONG = dhd.MA
                                 LEFT JOIN TCHC_CAN_BO benA ON hd_temp.SHCC = benA.SHCC
                                 LEFT JOIN DM_DON_VI dv on hd_temp.DON_VI_TRA_LUONG = dv.MA
                                 LEFT JOIN DM_NGACH_CDNN ncdnn ON hd_temp.NGACH = ncdnn.ID
                        WHERE (hd_temp.SHCC = hd.SHCC)
                            AND (((list_shcc IS NULL) AND (list_dv IS NULL) AND (fromYear IS NULL) AND (toYear IS NULL))
                            OR (((list_shcc IS NOT NULL AND
                                  ((INSTR(list_shcc, ',') != 0 AND INSTR(list_shcc, benA.SHCC) != 0) OR (list_shcc = benA.SHCC)))
                                OR (list_dv IS NOT NULL AND INSTR(list_dv, benA.MA_DON_VI) != 0)
                                OR (list_shcc IS NULL AND list_dv IS NULL))
                                AND (hd_temp.NGAY_KY_HOP_DONG IS NOT NULL AND (fromYear IS NULL OR hd_temp.NGAY_KY_HOP_DONG >= fromYear))
                                AND (hd_temp.NGAY_KY_HOP_DONG IS NOT NULL AND (toYear IS NULL OR hd_temp.NGAY_KY_HOP_DONG <= (toYear + 86399999)))))
                          AND (searchTerm = ''
                            OR LOWER(hd_temp.NGUOI_KY) LIKE sT
                            OR LOWER(hd_temp.SHCC) LIKE sT
                            OR LOWER(TRIM(benA.HO || ' ' || benA.TEN)) LIKE sT
                            OR LOWER(TRIM(nguoiKy.HO || ' ' || nguoiKy.TEN)) LIKE sT
                            OR LOWER(hd_temp.SO_HOP_DONG) LIKE sT)
                        )                  AS                   "soHd",

                        (select rtrim(xmlagg(
                                              xmlelement(e, hd_temp.NGAY_KY_HOP_DONG || ' ', '??').extract('//text()')
                                              order by null).getclobval(), '??')
                        FROM QT_HOP_DONG_DON_VI_TRA_LUONG hd_temp
                                 LEFT JOIN TCHC_CAN_BO nguoiKy on hd_temp.NGUOI_KY = nguoiKy.SHCC
                                 LEFT JOIN DM_LOAI_HOP_DONG dhd ON hd_temp.LOAI_HOP_DONG = dhd.MA
                                 LEFT JOIN TCHC_CAN_BO benA ON hd_temp.SHCC = benA.SHCC
                                 LEFT JOIN DM_DON_VI dv on hd_temp.DON_VI_TRA_LUONG = dv.MA
                                 LEFT JOIN DM_NGACH_CDNN ncdnn ON hd_temp.NGACH = ncdnn.ID
                        WHERE (hd_temp.SHCC = hd.SHCC)
                            AND (((list_shcc IS NULL) AND (list_dv IS NULL) AND (fromYear IS NULL) AND (toYear IS NULL))
                            OR (((list_shcc IS NOT NULL AND
                                  ((INSTR(list_shcc, ',') != 0 AND INSTR(list_shcc, benA.SHCC) != 0) OR (list_shcc = benA.SHCC)))
                                OR (list_dv IS NOT NULL AND INSTR(list_dv, benA.MA_DON_VI) != 0)
                                OR (list_shcc IS NULL AND list_dv IS NULL))
                                AND (hd_temp.NGAY_KY_HOP_DONG IS NOT NULL AND (fromYear IS NULL OR hd_temp.NGAY_KY_HOP_DONG >= fromYear))
                                AND (hd_temp.NGAY_KY_HOP_DONG IS NOT NULL AND (toYear IS NULL OR hd_temp.NGAY_KY_HOP_DONG <= (toYear + 86399999)))))
                          AND (searchTerm = ''
                            OR LOWER(hd_temp.NGUOI_KY) LIKE sT
                            OR LOWER(hd_temp.SHCC) LIKE sT
                            OR LOWER(TRIM(benA.HO || ' ' || benA.TEN)) LIKE sT
                            OR LOWER(TRIM(nguoiKy.HO || ' ' || nguoiKy.TEN)) LIKE sT
                            OR LOWER(hd_temp.SO_HOP_DONG) LIKE sT)
                        )                  AS                   "danhSachHd",

                        ROW_NUMBER() OVER (ORDER BY hd.NGAY_KY_HOP_DONG, benA.TEN DESC) R
                 FROM (SELECT *
                       FROM QT_HOP_DONG_DON_VI_TRA_LUONG
                       WHERE ID IN
                             (SELECT MAX(ID)
                              FROM (SELECT * FROM QT_HOP_DONG_DON_VI_TRA_LUONG ORDER BY ID DESC)
                              GROUP BY SHCC)) hd
                          LEFT JOIN TCHC_CAN_BO benA on hd.SHCC = benA.SHCC
                          LEFT JOIN TCHC_CAN_BO nguoiKy on hd.NGUOI_KY = nguoiKy.SHCC
                 ORDER BY hd.NGAY_KY_HOP_DONG DESC, benA.TEN DESC
             )
        WHERE R BETWEEN (pageNumber - 1) * pageSize + 1 AND pageNumber * pageSize;
    RETURN my_cursor;
END;

/
--EndMethod--

CREATE OR REPLACE FUNCTION QT_HOP_DONG_DON_VI_TRA_LUONG_SEARCH_PAGE(pageNumber IN OUT NUMBER, pageSize IN OUT NUMBER, filter IN STRING, searchTerm IN STRING,
                                                         totalItem OUT NUMBER, pageTotal OUT NUMBER) RETURN SYS_REFCURSOR
AS
    my_cursor SYS_REFCURSOR;
    sT        STRING(500) := '%' || lower(searchTerm) || '%';
    listShcc STRING (100);
    listDv STRING (100);
    fromYear NUMBER(20);
    toYear NUMBER(20);
BEGIN
    SELECT JSON_VALUE(filter, '$.listShcc') INTO listShcc FROM DUAL;
    SELECT JSON_VALUE(filter, '$.listDv') INTO listDv FROM DUAL;
    SELECT JSON_VALUE(filter, '$.fromYear' RETURNING NUMBER) INTO fromYear FROM DUAL;
    SELECT JSON_VALUE(filter, '$.toYear' RETURNING NUMBER) INTO toYear FROM DUAL;


    SELECT COUNT(*)
    INTO totalItem

    FROM QT_HOP_DONG_DON_VI_TRA_LUONG hd
             LEFT JOIN TCHC_CAN_BO nguoiKy on hd.NGUOI_KY = nguoiKy.SHCC
             LEFT JOIN DM_LOAI_HOP_DONG dhd ON hd.LOAI_HOP_DONG = dhd.MA
             LEFT JOIN TCHC_CAN_BO benA ON hd.SHCC = benA.SHCC
             LEFT JOIN DM_DON_VI dv on hd.DON_VI_TRA_LUONG = dv.MA
             LEFT JOIN DM_NGACH_CDNN ncdnn ON hd.NGACH = ncdnn.MA
             LEFT JOIN DM_CHUC_DANH_NGHE_NGHIEP cdnn on hd.CHUC_DANH_NGHE_NGHIEP = cdnn.MA
    WHERE (((listShcc IS NULL) AND (listDv IS NULL) AND (fromYear IS NULL) AND (toYear IS NULL))
        OR (((listShcc IS NOT NULL AND
              ((INSTR(listShcc, ',') != 0 AND INSTR(listShcc, benA.SHCC) != 0) OR (listShcc = benA.SHCC)))
            OR (listDv IS NOT NULL AND INSTR(listDv, benA.MA_DON_VI) != 0)
            OR (listShcc IS NULL AND listDv IS NULL))
            AND (hd.NGAY_KY_HOP_DONG IS NOT NULL AND (fromYear IS NULL OR hd.NGAY_KY_HOP_DONG >= fromYear))
            AND (hd.NGAY_KY_HOP_DONG IS NOT NULL AND (toYear IS NULL OR hd.NGAY_KY_HOP_DONG <= (toYear + 86399999)))))
      AND (searchTerm = ''
        OR LOWER(hd.NGUOI_KY) LIKE sT
        OR LOWER(hd.SHCC) LIKE sT
        OR LOWER(TRIM(benA.HO || ' ' || benA.TEN)) LIKE sT
        OR LOWER(TRIM(nguoiKy.HO || ' ' || nguoiKy.TEN)) LIKE sT
        OR LOWER(hd.SO_HOP_DONG) LIKE sT);

    IF pageNumber < 1 THEN pageNumber := 1; END IF;
    IF pageSize < 1 THEN pageSize := 1; END IF;
    pageTotal := CEIL(totalItem / pageSize);
    pageNumber := LEAST(pageNumber, pageTotal);

    OPEN my_cursor FOR
        SELECT *
        FROM (SELECT hd.SHCC              AS                 "shcc",
                     hd.ID                AS                 "ID",
                     benA.HO              AS                 "hoBenA",
                     benA.TEN             AS                 "tenBenA",
                     nguoiKy.SHCC         as                 "shccNguoiKy",
                     nguoiKy.HO           as                 "hoNguoiKy",
                     nguoiKy.TEN          as                 "tenNguoiKy",
                     nguoiKy.MA_CHUC_VU   as                 "chucVuNguoiKy",
                     nguoiKy.MA_DON_VI    as                 "donviNguoiKy",
                     hd.SO_HOP_DONG       as                 "soHopDong",
                     hd.LOAI_HOP_DONG     as                 "loaiHopDong",
                     dhd.TEN              as                 "tenLoaiHopDong",
                     hd.BAT_DAU_LAM_VIEC  as                 "batDauLamViec",
                     hd.KET_THUC_HOP_DONG as                 "ketThucHopDong",
                     hd.NGAY_TAI_KY       as                 "ngayTaiKy",
                     hd.DON_VI_TRA_LUONG  as                 "diaDiemLamViec",
                     dv.TEN               as                 "tenDiaDiemLamViec",
                     hd.CHUC_DANH_NGHE_NGHIEP         as                 "chucDanhNgheNghiep",
                     cdnn.TEN             as                 "tenChucDanhChuyenMon",
                     hd.NGACH             as                 "maNgach",
                     hd.BAC               as                 "bac",
                     hd.HE_SO             as                 "heSo",
                     hd.NGAY_KY_HOP_DONG  as                 "ngayKyHopDong",
                     hd.PHAN_TRAM_HUONG   as                 "phanTramHuong",
                     ROW_NUMBER() OVER (ORDER BY hd.ID DESC) R
              FROM QT_HOP_DONG_DON_VI_TRA_LUONG hd
                       LEFT JOIN TCHC_CAN_BO nguoiKy on hd.NGUOI_KY = nguoiKy.SHCC
                       LEFT JOIN DM_LOAI_HOP_DONG dhd ON hd.LOAI_HOP_DONG = dhd.MA
                       LEFT JOIN TCHC_CAN_BO benA ON hd.SHCC = benA.SHCC
                       LEFT JOIN DM_DON_VI dv on hd.DON_VI_TRA_LUONG = dv.MA
                       LEFT JOIN DM_NGACH_CDNN ncdnn ON hd.NGACH = ncdnn.MA
                       LEFT JOIN DM_NGACH_CDNN cdnn on hd.CHUC_DANH_NGHE_NGHIEP = cdnn.MA
              WHERE (((listShcc IS NULL) AND (listDv IS NULL) AND (fromYear IS NULL) AND (toYear IS NULL))
                  OR (((listShcc IS NOT NULL AND
                        ((INSTR(listShcc, ',') != 0 AND INSTR(listShcc, benA.SHCC) != 0) OR
                         (listShcc = benA.SHCC)))
                      OR (listDv IS NOT NULL AND INSTR(listDv, benA.MA_DON_VI) != 0)
                      OR (listShcc IS NULL AND listDv IS NULL))
                      AND (hd.NGAY_KY_HOP_DONG IS NOT NULL AND (fromYear IS NULL OR hd.NGAY_KY_HOP_DONG >= fromYear))
                      AND (hd.NGAY_KY_HOP_DONG IS NOT NULL AND
                           (toYear IS NULL OR hd.NGAY_KY_HOP_DONG <= (toYear + 86399999)))))
                AND (searchTerm = ''
                  OR LOWER(hd.NGUOI_KY) LIKE sT
                  OR LOWER(hd.SHCC) LIKE sT
                  OR LOWER(TRIM(benA.HO || ' ' || benA.TEN)) LIKE sT
                  OR LOWER(TRIM(nguoiKy.HO || ' ' || nguoiKy.TEN)) LIKE sT
                  OR LOWER(hd.SO_HOP_DONG) LIKE sT)
              ORDER BY hd.NGAY_KY_HOP_DONG DESC, benA.TEN DESC)
        WHERE R BETWEEN (pageNumber - 1) * pageSize + 1 AND pageNumber * pageSize;
    RETURN my_cursor;

END;

/
--EndMethod--

CREATE OR REPLACE FUNCTION QT_HOP_DONG_DON_VI_TRA_LUONG_SHCC_BY_DON_VI(maDonVi IN NUMBER) RETURN NUMBER
AS
    result  NUMBER(4);
BEGIN
    SELECT MAX(TO_NUMBER(SUBSTR(SHCC, 6))) INTO result
    FROM TCHC_CAN_BO cb
    WHERE SUBSTR(cb.SHCC, 1, 3) IN (SELECT PRE_SHCC FROM DM_DON_VI dv WHERE dv.MA = maDonVi);
    RETURN result;
END;

/
--EndMethod--

CREATE OR REPLACE FUNCTION QT_HOP_DONG_GET_MAX_SHCC_BY_DON_VI(maDonVi IN NUMBER) RETURN NUMBER
AS
    result  NUMBER(4);
BEGIN
    SELECT MAX(TO_NUMBER(SUBSTR(SHCC, 6))) INTO result
    FROM TCHC_CAN_BO cb
    WHERE SUBSTR(cb.SHCC, 1, 3) IN (SELECT PRE_SHCC FROM DM_DON_VI dv WHERE dv.MA = maDonVi);
    RETURN result;
END;

/
--EndMethod--

CREATE OR REPLACE FUNCTION QT_HOP_DONG_LAO_DONG_GROUP_PAGE(pageNumber IN OUT NUMBER, pageSize IN OUT NUMBER,
                                                list_shcc IN STRING, list_dv IN STRING,
                                                fromYear IN NUMBER, toYear IN NUMBER, searchTerm IN STRING,
                                                totalItem OUT NUMBER, pageTotal OUT NUMBER) RETURN SYS_REFCURSOR
AS
    my_cursor SYS_REFCURSOR;
    sT        STRING(500) := '%' || lower(searchTerm) || '%';
BEGIN
    SELECT COUNT(*)
    INTO totalItem
    FROM (SELECT *
          FROM QT_HOP_DONG_LAO_DONG
          WHERE MA IN
                (SELECT MAX(MA) FROM (SELECT * FROM QT_HOP_DONG_LAO_DONG ORDER BY MA DESC) GROUP BY NGUOI_DUOC_THUE)) hd
             LEFT JOIN TCHC_CAN_BO benA on hd.NGUOI_DUOC_THUE = benA.SHCC
             LEFT JOIN TCHC_CAN_BO nguoiKy on hd.NGUOI_KY = nguoiKy.SHCC;
    pageTotal := CEIL(totalItem / pageSize);
    pageNumber := LEAST(pageNumber, pageTotal);
    IF pageNumber < 1 THEN pageNumber := 1; END IF;
    IF pageSize < 1 THEN pageSize := 1; END IF;

    OPEN my_cursor FOR
        SELECT *
        FROM (
                 SELECT hd.NGUOI_DUOC_THUE AS                   "shcc",
                        hd.MA              AS                   "ma",
                        benA.HO            AS                   "hoBenA",
                        benA.TEN           AS                   "tenBenA",
                        (SELECT COUNT(*)
                        FROM QT_HOP_DONG_LAO_DONG hd_temp
                                 LEFT JOIN TCHC_CAN_BO nguoiKy on hd_temp.NGUOI_KY = nguoiKy.SHCC
                                 LEFT JOIN DM_LOAI_HOP_DONG dhd ON hd_temp.LOAI_HOP_DONG = dhd.MA
                                 LEFT JOIN TCHC_CAN_BO benA ON hd_temp.NGUOI_DUOC_THUE = benA.SHCC
                                 LEFT JOIN DM_DON_VI dv on hd_temp.DIA_DIEM_LAM_VIEC = dv.MA
                                 LEFT JOIN DM_NGACH_CDNN ncdnn ON hd_temp.MA_NGACH = ncdnn.MA
                                 LEFT JOIN DM_CHUC_DANH_CHUYEN_MON cdcm on hd_temp.CHUC_DANH_CHUYEN_MON = cdcm.MA
                        WHERE (hd_temp.NGUOI_DUOC_THUE = hd.NGUOI_DUOC_THUE)
                            AND (((list_shcc IS NULL) AND (list_dv IS NULL) AND (fromYear IS NULL) AND (toYear IS NULL))
                            OR (((list_shcc IS NOT NULL AND
                                  ((INSTR(list_shcc, ',') != 0 AND INSTR(list_shcc, benA.SHCC) != 0) OR (list_shcc = benA.SHCC)))
                                OR (list_dv IS NOT NULL AND INSTR(list_dv, benA.MA_DON_VI) != 0)
                                OR (list_shcc IS NULL AND list_dv IS NULL))
                                AND (hd_temp.NGAY_KY_HOP_DONG IS NOT NULL AND (fromYear IS NULL OR hd_temp.NGAY_KY_HOP_DONG >= fromYear))
                                AND (hd_temp.NGAY_KY_HOP_DONG IS NOT NULL AND (toYear IS NULL OR hd_temp.NGAY_KY_HOP_DONG <= (toYear + 86399999)))))
                          AND (searchTerm = ''
                            OR LOWER(hd_temp.NGUOI_KY) LIKE sT
                            OR LOWER(hd_temp.NGUOI_DUOC_THUE) LIKE sT
                            OR LOWER(TRIM(benA.HO || ' ' || benA.TEN)) LIKE sT
                            OR LOWER(TRIM(nguoiKy.HO || ' ' || nguoiKy.TEN)) LIKE sT
                            OR LOWER(hd_temp.SO_HOP_DONG) LIKE sT)
                        )                  AS                   "soHd",

                        (select rtrim(xmlagg(
                                              xmlelement(e, hd_temp.NGAY_KY_HOP_DONG || ' ', '??').extract('//text()')
                                              order by null).getclobval(), '??')
                        FROM QT_HOP_DONG_LAO_DONG hd_temp
                                 LEFT JOIN TCHC_CAN_BO nguoiKy on hd_temp.NGUOI_KY = nguoiKy.SHCC
                                 LEFT JOIN DM_LOAI_HOP_DONG dhd ON hd_temp.LOAI_HOP_DONG = dhd.MA
                                 LEFT JOIN TCHC_CAN_BO benA ON hd_temp.NGUOI_DUOC_THUE = benA.SHCC
                                 LEFT JOIN DM_DON_VI dv on hd_temp.DIA_DIEM_LAM_VIEC = dv.MA
                                 LEFT JOIN DM_NGACH_CDNN ncdnn ON hd_temp.MA_NGACH = ncdnn.MA
                                 LEFT JOIN DM_CHUC_DANH_CHUYEN_MON cdcm on hd_temp.CHUC_DANH_CHUYEN_MON = cdcm.MA
                        WHERE (hd_temp.NGUOI_DUOC_THUE = hd.NGUOI_DUOC_THUE)
                            AND (((list_shcc IS NULL) AND (list_dv IS NULL) AND (fromYear IS NULL) AND (toYear IS NULL))
                            OR (((list_shcc IS NOT NULL AND
                                  ((INSTR(list_shcc, ',') != 0 AND INSTR(list_shcc, benA.SHCC) != 0) OR (list_shcc = benA.SHCC)))
                                OR (list_dv IS NOT NULL AND INSTR(list_dv, benA.MA_DON_VI) != 0)
                                OR (list_shcc IS NULL AND list_dv IS NULL))
                                AND (hd_temp.NGAY_KY_HOP_DONG IS NOT NULL AND (fromYear IS NULL OR hd_temp.NGAY_KY_HOP_DONG >= fromYear))
                                AND (hd_temp.NGAY_KY_HOP_DONG IS NOT NULL AND (toYear IS NULL OR hd_temp.NGAY_KY_HOP_DONG <= (toYear + 86399999)))))
                          AND (searchTerm = ''
                            OR LOWER(hd_temp.NGUOI_KY) LIKE sT
                            OR LOWER(hd_temp.NGUOI_DUOC_THUE) LIKE sT
                            OR LOWER(TRIM(benA.HO || ' ' || benA.TEN)) LIKE sT
                            OR LOWER(TRIM(nguoiKy.HO || ' ' || nguoiKy.TEN)) LIKE sT
                            OR LOWER(hd_temp.SO_HOP_DONG) LIKE sT)
                        )                  AS                   "danhSachHd",

                        ROW_NUMBER() OVER (ORDER BY hd.NGAY_KY_HOP_DONG, benA.TEN DESC) R
                 FROM (SELECT *
                       FROM QT_HOP_DONG_LAO_DONG
                       WHERE MA IN
                             (SELECT MAX(MA)
                              FROM (SELECT * FROM QT_HOP_DONG_LAO_DONG ORDER BY MA DESC)
                              GROUP BY NGUOI_DUOC_THUE)) hd
                          LEFT JOIN TCHC_CAN_BO benA on hd.NGUOI_DUOC_THUE = benA.SHCC
                          LEFT JOIN TCHC_CAN_BO nguoiKy on hd.NGUOI_KY = nguoiKy.SHCC
                 ORDER BY hd.NGAY_KY_HOP_DONG DESC, benA.TEN DESC
             )
        WHERE R BETWEEN (pageNumber - 1) * pageSize + 1 AND pageNumber * pageSize;
    RETURN my_cursor;
END;

/
--EndMethod--

CREATE OR REPLACE FUNCTION QT_HOP_DONG_LAO_DONG_SEARCH_PAGE(pageNumber IN OUT NUMBER, pageSize IN OUT NUMBER,
                                                 list_shcc IN STRING, list_dv IN STRING,
                                                 fromYear IN NUMBER, toYear IN NUMBER, searchTerm IN STRING,
                                                 totalItem OUT NUMBER, pageTotal OUT NUMBER) RETURN SYS_REFCURSOR
AS
    my_cursor SYS_REFCURSOR;
    sT        STRING(500) := '%' || lower(searchTerm) || '%';
BEGIN
    SELECT COUNT(*)
    INTO totalItem

    FROM QT_HOP_DONG_LAO_DONG hd
             LEFT JOIN TCHC_CAN_BO nguoiKy on hd.NGUOI_KY = nguoiKy.SHCC
             LEFT JOIN DM_LOAI_HOP_DONG dhd ON hd.LOAI_HOP_DONG = dhd.MA
             LEFT JOIN TCHC_CAN_BO benA ON hd.NGUOI_DUOC_THUE = benA.SHCC
             LEFT JOIN DM_DON_VI dv on hd.DIA_DIEM_LAM_VIEC = dv.MA
             LEFT JOIN DM_NGACH_CDNN ncdnn ON hd.MA_NGACH = ncdnn.MA
             LEFT JOIN DM_CHUC_DANH_CHUYEN_MON cdcm on hd.CHUC_DANH_CHUYEN_MON = cdcm.MA
    WHERE (((list_shcc IS NULL) AND (list_dv IS NULL) AND (fromYear IS NULL) AND (toYear IS NULL))
        OR (((list_shcc IS NOT NULL AND
              ((INSTR(list_shcc, ',') != 0 AND INSTR(list_shcc, benA.SHCC) != 0) OR (list_shcc = benA.SHCC)))
            OR (list_dv IS NOT NULL AND INSTR(list_dv, benA.MA_DON_VI) != 0)
            OR (list_shcc IS NULL AND list_dv IS NULL))
            AND (hd.NGAY_KY_HOP_DONG IS NOT NULL AND (fromYear IS NULL OR hd.NGAY_KY_HOP_DONG >= fromYear))
            AND (hd.NGAY_KY_HOP_DONG IS NOT NULL AND (toYear IS NULL OR hd.NGAY_KY_HOP_DONG <= (toYear + 86399999)))))
      AND (searchTerm = ''
        OR LOWER(hd.NGUOI_KY) LIKE sT
        OR LOWER(hd.NGUOI_DUOC_THUE) LIKE sT
        OR LOWER(TRIM(benA.HO || ' ' || benA.TEN)) LIKE sT
        OR LOWER(TRIM(nguoiKy.HO || ' ' || nguoiKy.TEN)) LIKE sT
        OR LOWER(hd.SO_HOP_DONG) LIKE sT);

    IF pageNumber < 1 THEN pageNumber := 1; END IF;
    IF pageSize < 1 THEN pageSize := 1; END IF;
    pageTotal := CEIL(totalItem / pageSize);
    pageNumber := LEAST(pageNumber, pageTotal);

    OPEN my_cursor FOR
        SELECT *
        FROM (
                 SELECT hd.NGUOI_DUOC_THUE      AS              "shcc",
                        hd.MA                   AS              "ma",
                        benA.HO                 AS              "hoBenA",
                        benA.TEN                AS              "tenBenA",
                        nguoiKy.SHCC            as              "shccNguoiKy",
                        nguoiKy.HO              as              "hoNguoiKy",
                        nguoiKy.TEN             as              "tenNguoiKy",
                        nguoiKy.MA_CHUC_VU      as              "chucVuNguoiKy",
                        nguoiKy.MA_DON_VI       as              "donviNguoiKy",
                        hd.SO_HOP_DONG          as              "soHopDong",
                        hd.LOAI_HOP_DONG        as              "loaiHopDong",
                        dhd.TEN                 as              "tenLoaiHopDong",
                        hd.BAT_DAU_LAM_VIEC     as              "batDauLamViec",
                        hd.KET_THUC_HOP_DONG    as              "ketThucHopDong",
                        hd.NGAY_KY_HD_TIEP_THEO as              "ngayKyHopDongTiepTheo",
                        hd.DIA_DIEM_LAM_VIEC    as              "diaDiemLamViec",
                        dv.TEN                  as              "tenDiaDiemLamViec",
                        hd.CHUC_DANH_CHUYEN_MON as              "chucDanhChuyenMon",
                        cdcm.TEN                as              "tenChucDanhChuyenMon",
                        hd.CONG_VIEC_DUOC_GIAO  as              "congViecDuocGiao",
                        hd.CHIU_SU_PHAN_CONG    as              "chiuSuPhanCong",
                        hd.MA_NGACH             as              "maNgach",
                        hd.BAC                  as              "bac",
                        hd.HE_SO                as              "heSo",
                        hd.NGAY_KY_HOP_DONG     as              "ngayKyHopDong",
                        hd.PHAN_TRAM_HUONG      as              "phanTramHuong",
                        ROW_NUMBER() OVER (ORDER BY hd.MA DESC) R
                 FROM QT_HOP_DONG_LAO_DONG hd
                          LEFT JOIN TCHC_CAN_BO nguoiKy on hd.NGUOI_KY = nguoiKy.SHCC
                          LEFT JOIN DM_LOAI_HOP_DONG dhd ON hd.LOAI_HOP_DONG = dhd.MA
                          LEFT JOIN TCHC_CAN_BO benA ON hd.NGUOI_DUOC_THUE = benA.SHCC
                          LEFT JOIN DM_DON_VI dv on hd.DIA_DIEM_LAM_VIEC = dv.MA
                          LEFT JOIN DM_NGACH_CDNN ncdnn ON hd.MA_NGACH = ncdnn.MA
                          LEFT JOIN DM_CHUC_DANH_CHUYEN_MON cdcm on hd.CHUC_DANH_CHUYEN_MON = cdcm.MA
                 WHERE (((list_shcc IS NULL) AND (list_dv IS NULL) AND (fromYear IS NULL) AND (toYear IS NULL))
                     OR (((list_shcc IS NOT NULL AND
                           ((INSTR(list_shcc, ',') != 0 AND INSTR(list_shcc, benA.SHCC) != 0) OR
                            (list_shcc = benA.SHCC)))
                         OR (list_dv IS NOT NULL AND INSTR(list_dv, benA.MA_DON_VI) != 0)
                         OR (list_shcc IS NULL AND list_dv IS NULL))
                         AND (hd.NGAY_KY_HOP_DONG IS NOT NULL AND (fromYear IS NULL OR hd.NGAY_KY_HOP_DONG >= fromYear))
                         AND (hd.NGAY_KY_HOP_DONG IS NOT NULL AND (toYear IS NULL OR hd.NGAY_KY_HOP_DONG <= (toYear + 86399999)))))
                   AND (searchTerm = ''
                     OR LOWER(hd.NGUOI_KY) LIKE sT
                     OR LOWER(hd.NGUOI_DUOC_THUE) LIKE sT
                     OR LOWER(TRIM(benA.HO || ' ' || benA.TEN)) LIKE sT
                     OR LOWER(TRIM(nguoiKy.HO || ' ' || nguoiKy.TEN)) LIKE sT
                     OR LOWER(hd.SO_HOP_DONG) LIKE sT)
                 ORDER BY hd.NGAY_KY_HOP_DONG DESC, benA.TEN DESC
             )
        WHERE R BETWEEN (pageNumber - 1) * pageSize + 1 AND pageNumber * pageSize;
    RETURN my_cursor;

END;

/
--EndMethod--

CREATE OR REPLACE FUNCTION QT_HOP_DONG_TRACH_NHIEM_SEARCH_PAGE(pageNumber IN OUT NUMBER, pageSize IN OUT NUMBER,
                                                    filter IN STRING, searchTerm IN STRING,
                                                    totalItem OUT NUMBER, pageTotal OUT NUMBER) RETURN SYS_REFCURSOR
AS
    my_cursor SYS_REFCURSOR;
    sT        STRING(500) := '%' || lower(searchTerm) || '%';
BEGIN
    SELECT COUNT(*)
    INTO totalItem

    FROM QT_HOP_DONG_TRACH_NHIEM hd
             LEFT JOIN TCHC_CAN_BO cbk on hd.NGUOI_KY = cbk.SHCC
             LEFT JOIN TCHC_CAN_BO cbtl ON hd.NGUOI_DUOC_THUE = cbtl.SHCC
             LEFT JOIN DM_DON_VI dv on hd.DIA_DIEM_LAM_VIEC = dv.MA
    WHERE (searchTerm = ''
        OR LOWER(hd.NGUOI_KY) LIKE sT
        OR LOWER(hd.NGUOI_DUOC_THUE) LIKE sT
        OR LOWER(TRIM(cbtl.HO || ' ' || cbtl.TEN)) LIKE sT
        OR LOWER(TRIM(cbk.HO || ' ' || cbk.TEN)) LIKE sT
        OR LOWER(hd.SO_HOP_DONG) LIKE sT);

    IF pageNumber < 1 THEN pageNumber := 1; END IF;
    IF pageSize < 1 THEN pageSize := 1; END IF;
    pageTotal := CEIL(totalItem / pageSize);
    pageNumber := LEAST(pageNumber, pageTotal);

    OPEN my_cursor FOR
        SELECT *
        FROM (SELECT hd.NGUOI_DUOC_THUE      AS              "shcc",
                     hd.MA                   AS              "ma",
                     cbtl.HO                 AS              "ho",
                     cbtl.TEN                AS              "ten",
                     cbtl.PHAI               AS              "phai",
                     cbtl.NGAY_SINH          AS              "ngaySinh",
                     hd.NGUOI_KY             as              "nguoiKy",
                     cbk.SHCC                as              "shccNguoiKy",
                     cbk.HO                  as              "hoNguoiKy",
                     cbk.TEN                 as              "tenNguoiKy",
                     hd.SO_HOP_DONG          as              "soHopDong",
                     hd.KET_THUC_HOP_DONG    as              "ketThucHopDong",
                     hd.NGAY_KY_HD_TIEP_THEO as              "ngayKyHopDongTiepTheo",
                     hd.DIA_DIEM_LAM_VIEC    as              "diaDiemLamViec",
                     dv.TEN                  as              "tenDiaDiemLamViec",
                     hd.CONG_VIEC_DUOC_GIAO  as              "congViecDuocGiao",
                     hd.CHIU_SU_PHAN_CONG    as              "chiuSuPhanCong",
                     hd.NGACH                as              "ngach",
                     hd.HIEU_LUC_HOP_DONG    as              "hieuLucHopDong",
                     hd.NGAY_KY_HOP_DONG     as              "ngayKyHopDong",
                     hd.TIEN_LUONG           as              "tienLuong",
                     ROW_NUMBER() OVER (ORDER BY hd.MA DESC) R

              FROM QT_HOP_DONG_TRACH_NHIEM hd
                       LEFT JOIN TCHC_CAN_BO cbk on hd.NGUOI_KY = cbk.SHCC
                       LEFT JOIN TCHC_CAN_BO cbtl ON hd.NGUOI_DUOC_THUE = cbtl.SHCC
                       LEFT JOIN DM_DON_VI dv on hd.DIA_DIEM_LAM_VIEC = dv.MA
              WHERE (searchTerm = ''
                  OR LOWER(hd.NGUOI_KY) LIKE sT
                  OR LOWER(hd.NGUOI_DUOC_THUE) LIKE sT
                  OR LOWER(TRIM(cbtl.HO || ' ' || cbtl.TEN)) LIKE sT
                  OR LOWER(TRIM(cbk.HO || ' ' || cbk.TEN)) LIKE sT
                  OR LOWER(hd.SO_HOP_DONG) LIKE sT)
              ORDER BY hd.NGAY_KY_HOP_DONG DESC, hd.SO_HOP_DONG DESC)
        WHERE R BETWEEN (pageNumber - 1) * pageSize + 1 AND pageNumber * pageSize;
    RETURN my_cursor;

END;

/
--EndMethod--

CREATE OR REPLACE FUNCTION QT_HOP_DONG_VIEN_CHUC_GROUP_PAGE(pageNumber IN OUT NUMBER, pageSize IN OUT NUMBER,
                                                 list_shcc IN STRING, list_dv IN STRING,
                                                 fromYear IN NUMBER, toYear IN NUMBER, searchTerm IN STRING,
                                                 totalItem OUT NUMBER, pageTotal OUT NUMBER) RETURN SYS_REFCURSOR
AS
    my_cursor SYS_REFCURSOR;
    ST        STRING(500) := '%' || lower(searchTerm) || '%';
BEGIN
    SELECT COUNT(*)
    INTO totalItem
    FROM (SELECT *
          FROM QT_HOP_DONG_VIEN_CHUC
          WHERE MA IN (
              SELECT MAX(MA)
              FROM (SELECT * FROM QT_HOP_DONG_VIEN_CHUC ORDER BY NGUOI_DUOC_THUE DESC)
              GROUP BY NGUOI_DUOC_THUE)) hdvc
             LEFT JOIN TCHC_CAN_BO cb on hdvc.NGUOI_DUOC_THUE = cb.SHCC;

    IF pageNumber < 1 THEN pageNumber := 1; END IF;
    IF pageSize < 1 THEN pageSize := 1; END IF;
    pageTotal := CEIL(totalItem / pageSize);
    pageNumber := LEAST(pageNumber, pageTotal);

    OPEN my_cursor FOR
        SELECT *
        FROM (
                 SELECT hdvc.MA           AS                "ma",
                        hdvc.NGUOI_DUOC_THUE AS "shcc",
                        (SELECT COUNT(*)
                        FROM QT_HOP_DONG_VIEN_CHUC hdvc_temp
                                 LEFT JOIN TCHC_CAN_BO benA on hdvc_temp.NGUOI_KY = benA.SHCC
                                 LEFT JOIN DM_LOAI_HOP_DONG lhd ON hdvc_temp.LOAI_HD = lhd.MA
                                 LEFT JOIN TCHC_CAN_BO benB ON hdvc_temp.NGUOI_DUOC_THUE = benB.SHCC
                                 LEFT JOIN DM_DON_VI dv on hdvc_temp.DIA_DIEM_LAM_VIEC = dv.MA
                                 LEFT JOIN DM_NGACH_CDNN ncdnn ON hdvc_temp.MA_NGACH = ncdnn.MA
                                 LEFT JOIN DM_CHUC_DANH_CHUYEN_MON cdcm on hdvc_temp.CHUC_DANH_CHUYEN_MON = cdcm.MA
                        WHERE (TO_CHAR(hdvc_temp.NGUOI_DUOC_THUE) = TO_CHAR(hdvc.NGUOI_DUOC_THUE))
                            AND (((list_shcc IS NULL) AND (list_dv IS NULL) AND (fromYear IS NULL) AND (toYear IS NULL))
                            OR (((list_shcc IS NOT NULL AND
                                  ((INSTR(list_shcc, ',') != 0 AND INSTR(list_shcc, benB.SHCC) != 0) OR (list_shcc = benB.SHCC)))
                                OR (list_dv IS NOT NULL AND INSTR(list_dv, benB.MA_DON_VI) != 0)
                                OR (list_shcc IS NULL AND list_dv IS NULL))
                                AND (hdvc_temp.NGAY_KY_QUYET_DINH IS NOT NULL AND (fromYear IS NULL OR hdvc_temp.NGAY_KY_QUYET_DINH >= fromYear))
                                AND (hdvc_temp.NGAY_KY_QUYET_DINH IS NOT NULL AND (toYear IS NULL OR hdvc_temp.NGAY_KY_QUYET_DINH <= (toYear + 86399999)))))
                          AND (searchTerm = ''
                            OR LOWER(hdvc_temp.NGUOI_KY) LIKE sT
                            OR LOWER(hdvc_temp.NGUOI_DUOC_THUE) LIKE sT
                            OR LOWER(TRIM(benA.HO || ' ' || benA.TEN)) LIKE sT
                            OR LOWER(TRIM(benB.HO || ' ' || benB.TEN)) LIKE sT
                            OR LOWER(hdvc_temp.SO_QD) LIKE sT
                            OR LOWER(ncdnn.TEN) LIKE sT)
                        ) AS "soHd",

                        (select rtrim(xmlagg(xmlelement(e, hdvc_temp.NGAY_KY_QUYET_DINH || ' ','??').extract('//text()') order by null).getclobval(),'??')
                        FROM QT_HOP_DONG_VIEN_CHUC hdvc_temp
                                 LEFT JOIN TCHC_CAN_BO benA on hdvc_temp.NGUOI_KY = benA.SHCC
                                 LEFT JOIN DM_LOAI_HOP_DONG lhd ON hdvc_temp.LOAI_HD = lhd.MA
                                 LEFT JOIN TCHC_CAN_BO benB ON hdvc_temp.NGUOI_DUOC_THUE = benB.SHCC
                                 LEFT JOIN DM_DON_VI dv on hdvc_temp.DIA_DIEM_LAM_VIEC = dv.MA
                                 LEFT JOIN DM_NGACH_CDNN ncdnn ON hdvc_temp.MA_NGACH = ncdnn.MA
                                 LEFT JOIN DM_CHUC_DANH_CHUYEN_MON cdcm on hdvc_temp.CHUC_DANH_CHUYEN_MON = cdcm.MA
                        WHERE (TO_CHAR(hdvc_temp.NGUOI_DUOC_THUE) = TO_CHAR(hdvc.NGUOI_DUOC_THUE))
                            AND (((list_shcc IS NULL) AND (list_dv IS NULL) AND (fromYear IS NULL) AND (toYear IS NULL))
                            OR (((list_shcc IS NOT NULL AND
                                  ((INSTR(list_shcc, ',') != 0 AND INSTR(list_shcc, benB.SHCC) != 0) OR (list_shcc = benB.SHCC)))
                                OR (list_dv IS NOT NULL AND INSTR(list_dv, benB.MA_DON_VI) != 0)
                                OR (list_shcc IS NULL AND list_dv IS NULL))
                                AND (hdvc_temp.NGAY_KY_QUYET_DINH IS NOT NULL AND (fromYear IS NULL OR hdvc_temp.NGAY_KY_QUYET_DINH >= fromYear))
                                AND (hdvc_temp.NGAY_KY_QUYET_DINH IS NOT NULL AND (toYear IS NULL OR hdvc_temp.NGAY_KY_QUYET_DINH <= (toYear + 86399999)))))
                          AND (searchTerm = ''
                            OR LOWER(hdvc_temp.NGUOI_KY) LIKE sT
                            OR LOWER(hdvc_temp.NGUOI_DUOC_THUE) LIKE sT
                            OR LOWER(TRIM(benA.HO || ' ' || benA.TEN)) LIKE sT
                            OR LOWER(TRIM(benB.HO || ' ' || benB.TEN)) LIKE sT
                            OR LOWER(hdvc_temp.SO_QD) LIKE sT
                            OR LOWER(ncdnn.TEN) LIKE sT)
                        ) AS "danhSachHd",

                        cb.TEN               as                                  "tenBenB",
                        cb.HO                as                                  "hoBenB",

                        ROW_NUMBER() OVER (ORDER BY NGAY_KY_QUYET_DINH DESC) R
                FROM (SELECT *
                      FROM QT_HOP_DONG_VIEN_CHUC
                      WHERE MA IN (
                          SELECT MAX(MA)
                          FROM (SELECT * FROM QT_HOP_DONG_VIEN_CHUC ORDER BY NGUOI_DUOC_THUE DESC)
                          GROUP BY NGUOI_DUOC_THUE)) hdvc
                         LEFT JOIN TCHC_CAN_BO cb on hdvc.NGUOI_DUOC_THUE = cb.SHCC
                ORDER BY hdvc.NGAY_KY_QUYET_DINH DESC
             )
        WHERE R BETWEEN (pageNumber - 1) * pageSize + 1 AND pageNumber * pageSize;
    RETURN my_cursor;

END;

/
--EndMethod--

CREATE OR REPLACE FUNCTION QT_HOP_DONG_VIEN_CHUC_SEARCH_PAGE(pageNumber IN OUT NUMBER, pageSize IN OUT NUMBER,
                                                  list_shcc IN STRING, list_dv IN STRING,
                                                  fromYear IN NUMBER, toYear IN NUMBER, searchTerm IN STRING,
                                                  totalItem OUT NUMBER, pageTotal OUT NUMBER) RETURN SYS_REFCURSOR
AS
    my_cursor SYS_REFCURSOR;
    sT        STRING(500) := '%' || lower(searchTerm) || '%';
BEGIN
    SELECT COUNT(*)
    INTO totalItem

    FROM QT_HOP_DONG_VIEN_CHUC hd
             LEFT JOIN TCHC_CAN_BO benA on hd.NGUOI_KY = benA.SHCC
             LEFT JOIN DM_LOAI_HOP_DONG lhd ON hd.LOAI_HD = lhd.MA
             LEFT JOIN TCHC_CAN_BO benB ON hd.NGUOI_DUOC_THUE = benB.SHCC
             LEFT JOIN DM_DON_VI dv on hd.DIA_DIEM_LAM_VIEC = dv.MA
             LEFT JOIN DM_NGACH_CDNN ncdnn ON hd.MA_NGACH = ncdnn.MA
             LEFT JOIN DM_CHUC_DANH_CHUYEN_MON cdcm on hd.CHUC_DANH_CHUYEN_MON = cdcm.MA
    WHERE (((list_shcc IS NULL) AND (list_dv IS NULL) AND (fromYear IS NULL) AND (toYear IS NULL))
        OR (((list_shcc IS NOT NULL AND
              ((INSTR(list_shcc, ',') != 0 AND INSTR(list_shcc, benB.SHCC) != 0) OR (list_shcc = benB.SHCC)))
            OR (list_dv IS NOT NULL AND INSTR(list_dv, benB.MA_DON_VI) != 0)
            OR (list_shcc IS NULL AND list_dv IS NULL))
            AND (hd.NGAY_KY_QUYET_DINH IS NOT NULL AND (fromYear IS NULL OR hd.NGAY_KY_QUYET_DINH >= fromYear))
            AND (hd.NGAY_KY_QUYET_DINH IS NOT NULL AND (toYear IS NULL OR hd.NGAY_KY_QUYET_DINH <= (toYear + 86399999)))))
      AND (searchTerm = ''
        OR LOWER(hd.NGUOI_KY) LIKE sT
        OR LOWER(hd.NGUOI_DUOC_THUE) LIKE sT
        OR LOWER(TRIM(benA.HO || ' ' || benA.TEN)) LIKE sT
        OR LOWER(TRIM(benB.HO || ' ' || benB.TEN)) LIKE sT
        OR LOWER(hd.SO_QD) LIKE sT
        OR LOWER(ncdnn.TEN) LIKE sT);

    IF pageNumber < 1 THEN pageNumber := 1; END IF;
    IF pageSize < 1 THEN pageSize := 1; END IF;
    pageTotal := CEIL(totalItem / pageSize);
    pageNumber := LEAST(pageNumber, pageTotal);

    OPEN my_cursor FOR
        SELECT *
        FROM (
                 SELECT hd.NGUOI_DUOC_THUE              AS                      "shcc",
                        hd.MA                           AS                      "ma",
                        benB.HO                         AS                      "hoBenB",
                        benB.TEN                        AS                      "tenBenB",
                        benA.SHCC                       as                      "shccNguoiKy",
                        benA.HO                         as                      "hoNguoiKy",
                        benA.TEN                        as                      "tenNguoiKy",
                        benA.MA_CHUC_VU                 as                      "chucVuNguoiKy",
                        benA.MA_DON_VI                  as                      "donviNguoiKy",
                        hd.SO_QD                        as                      "soQuyetDinh",
                        hd.NOI_DUNG                     as                      "noiDung",
                        hd.LOAI_HD                      as                      "loaiHopDong",
                        lhd.TEN                         as                      "tenLoaiHopDong",
                        hd.NGAY_KY_HOP_DONG             as                      "ngayKyHopDong",
                        hd.NGAY_KET_THUC_HOP_DONG       as                      "ketThucHopDong",
                        hd.NGAY_KY_QUYET_DINH           as                      "ngayKyQuyetDinh",
                        hd.NGAY_KY_HD_TIEP_THEO         as                      "ngayKyHopDongTiepTheo",
                        hd.HIEU_LUC_HOP_DONG            as                      "hieuLucHopDong",
                        hd.NGAY_BAT_DAU_LAM_VIEC        as                      "batDauLamViec",
                        hd.DIA_DIEM_LAM_VIEC            as                      "diaDiemLamViec",
                        dv.TEN                          as                      "tenDiaDiemLamViec",
                        hd.CHUC_DANH_CHUYEN_MON         as                      "chucDanhChuyenMon",
                        cdcm.TEN                        as                      "tenChucDanhChuyenMon",
                        hd.NHIEM_VU                     as                      "congViecDuocGiao",
                        hd.MA_NGACH                     as                      "maNgach",
                        hd.BAC                          as                      "bac",
                        hd.HE_SO                        as                      "heSo",
                        hd.THOI_GIAN_XET_NANG_BAC_LUONG as                      "thoiGianXetNangBacLuong",
                        ROW_NUMBER() OVER (ORDER BY hd.NGAY_KY_HOP_DONG DESC) R
                 FROM QT_HOP_DONG_VIEN_CHUC hd
                          LEFT JOIN TCHC_CAN_BO benA on hd.NGUOI_KY = benA.SHCC
                          LEFT JOIN DM_LOAI_HOP_DONG lhd ON hd.LOAI_HD = lhd.MA
                          LEFT JOIN TCHC_CAN_BO benB ON hd.NGUOI_DUOC_THUE = benB.SHCC
                          LEFT JOIN DM_DON_VI dv on hd.DIA_DIEM_LAM_VIEC = dv.MA
                          LEFT JOIN DM_NGACH_CDNN ncdnn ON hd.MA_NGACH = ncdnn.MA
                          LEFT JOIN DM_CHUC_DANH_CHUYEN_MON cdcm on hd.CHUC_DANH_CHUYEN_MON = cdcm.MA
                 WHERE (((list_shcc IS NULL) AND (list_dv IS NULL) AND (fromYear IS NULL) AND (toYear IS NULL))
                     OR (((list_shcc IS NOT NULL AND
                           ((INSTR(list_shcc, ',') != 0 AND INSTR(list_shcc, benB.SHCC) != 0) OR
                            (list_shcc = benB.SHCC)))
                         OR (list_dv IS NOT NULL AND INSTR(list_dv, benB.MA_DON_VI) != 0)
                         OR (list_shcc IS NULL AND list_dv IS NULL))
                         AND (hd.NGAY_KY_QUYET_DINH IS NOT NULL AND (fromYear IS NULL OR hd.NGAY_KY_QUYET_DINH >= fromYear))
                         AND (hd.NGAY_KY_QUYET_DINH IS NOT NULL AND (toYear IS NULL OR hd.NGAY_KY_QUYET_DINH <= (toYear + 86399999)))))
                   AND (searchTerm = ''
                     OR LOWER(hd.NGUOI_KY) LIKE sT
                     OR LOWER(hd.NGUOI_DUOC_THUE) LIKE sT
                     OR LOWER(TRIM(benA.HO || ' ' || benA.TEN)) LIKE sT
                     OR LOWER(TRIM(benB.HO || ' ' || benB.TEN)) LIKE sT
                     OR LOWER(hd.SO_QD) LIKE sT
                     OR LOWER(ncdnn.TEN) LIKE sT)
                 ORDER BY hd.NGAY_KY_HOP_DONG DESC, benB.TEN DESC
             )
        WHERE R BETWEEN (pageNumber - 1) * pageSize + 1 AND pageNumber * pageSize;
    RETURN my_cursor;

END;

/
--EndMethod--

CREATE OR REPLACE FUNCTION QT_HO_TRO_HOC_PHI_DOWNLOAD_EXCEL(list_shcc IN STRING, list_dv IN STRING,
                                          fromYear IN NUMBER, toYear IN NUMBER, timeType IN NUMBER, tinhTrang IN NUMBER,
                                          loaiHocVi IN STRING) RETURN SYS_REFCURSOR
AS
    my_cursor SYS_REFCURSOR;
    today     NUMBER(20);
BEGIN
    select (cast(sysdate as date) - cast(to_date('1970-01-01', 'YYYY-MM-DD') as date)) * 86400000 into today from dual;
    OPEN my_cursor FOR
        SELECT *
        FROM (
                 SELECT qththp.ID               AS                  "id",
                        qththp.SHCC             AS                  "shcc",
                        qththp.BAT_DAU   AS "batDau",
                        qththp.BAT_DAU_TYPE  AS "batDauType",
                        qththp.KET_THUC   AS "ketThuc",
                        qththp.KET_THUC_TYPE  AS "ketThucType",
                        qththp.GHI_CHU   AS "ghiChu",
                        qththp.HO_SO AS "hoSo",
                        qththp.NGAY_LAM_DON   AS "ngayLamDon",
                        qththp.NOI_DUNG   AS "noiDung",
                        qththp.SO_TIEN   AS "soTien",
                        qththp.CO_SO_DAO_TAO   AS "coSoDaoTao",
                        qththp.HOC_KY_HO_TRO AS "hocKyHoTro",

                        today                 AS                  "today",
                        cb.HO                 AS                  "hoCanBo",
                        cb.TEN                AS                  "tenCanBo",

                        dv.MA                 AS                  "maDonVi",
                        dv.TEN                AS                  "tenDonVi",
                        cv.MA   AS "maChucVu",
                        cv.TEN  AS "tenChucVu",
                        cb.CHUYEN_NGANH AS "tenChuyenNganh",

                        td.MA   AS "maHocVi",
                        td.TEN  AS "tenHocVi",

                        cdnn.MA AS "maChucDanhNgheNghiep",
                        cdnn.TEN AS "tenChucDanhNgheNghiep",

                        dmhthpcs.TEN    AS "tenCoSoDaoTao",
                        ROW_NUMBER() OVER (ORDER BY BAT_DAU DESC) R
                FROM QT_HO_TRO_HOC_PHI qththp
                         LEFT JOIN TCHC_CAN_BO cb on qththp.SHCC = cb.SHCC
                         LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
                         LEFT JOIN DM_HO_TRO_HOC_PHI_CO_SO dmhthpcs on dmhthpcs.MA = qththp.CO_SO_DAO_TAO
                         LEFT JOIN DM_CHUC_VU cv ON (cb.MA_CHUC_VU = cv.MA)
                         LEFT JOIN DM_TRINH_DO td ON (cb.HOC_VI = td.MA)
                         LEFT JOIN DM_NGACH_CDNN cdnn ON (cdnn.MA = cb.NGACH)
                WHERE (((list_shcc IS NULL) AND (list_dv IS NULL) AND (fromYear IS NULL) AND (toYear IS NULL) AND (timeType = 0) AND (tinhTrang IS NULL) AND (loaiHocVi IS NULL))
                    OR (((list_shcc IS NOT NULL AND cb.SHCC IN (SELECT regexp_substr(list_shcc, '[^,]+', 1, level) from dual connect by regexp_substr(list_shcc, '[^,]+', 1, level) is not null))
                  OR (list_dv IS NOT NULL AND cb.MA_DON_VI IN (SELECT regexp_substr(list_dv, '[^,]+', 1, level) from dual connect by regexp_substr(list_dv, '[^,]+', 1, level) is not null))
                  OR (list_shcc IS NULL AND list_dv IS NULL))
                        AND (loaiHocVi IS NULL OR INSTR(loaiHocVi, cb.HOC_VI) != 0)
                        AND (timeType = 0 OR (
                                    timeType = 1 AND
                                    (qththp.BAT_DAU IS NOT NULL AND (fromYear IS NULL OR qththp.BAT_DAU >= fromYear)) AND
                                    (toYear IS NULL OR qththp.BAT_DAU <= toYear)
                            ) OR (
                                timeType = 2
                                AND (qththp.NGAY_LAM_DON IS NOT NULL AND (fromYear IS NULL OR qththp.NGAY_LAM_DON >= fromYear))
                                AND (toYear IS NULL OR qththp.NGAY_LAM_DON <= toYear)
                            ))
                        AND (tinhTrang IS NULL OR ((qththp.KET_THUC = -1 OR qththp.KET_THUC >= today) AND tinhTrang = 2) OR
                             (qththp.KET_THUC IS NOT NULL AND qththp.KET_THUC != -1 AND qththp.KET_THUC < today AND tinhTrang = 1))))
                 ORDER BY qththp.BAT_DAU DESC
             );
    RETURN my_cursor;

END;

/
--EndMethod--

CREATE OR REPLACE FUNCTION QT_HO_TRO_HOC_PHI_GROUP_PAGE(pageNumber IN OUT NUMBER, pageSize IN OUT NUMBER,
                                          list_shcc IN STRING, list_dv IN STRING,
                                          fromYear IN NUMBER, toYear IN NUMBER, timeType IN NUMBER, tinhTrang IN NUMBER,
                                          loaiHocVi IN STRING, searchTerm IN STRING,
                                          totalItem OUT NUMBER, pageTotal OUT NUMBER) RETURN SYS_REFCURSOR
AS
    my_cursor SYS_REFCURSOR;
    sT        STRING(500) := '%' || lower(searchTerm) || '%';
    today     NUMBER(20);
BEGIN
    select (cast(sysdate as date) - cast(to_date('1970-01-01', 'YYYY-MM-DD') as date)) * 86400000 into today from dual;
    SELECT COUNT(*)
    INTO totalItem

    FROM (SELECT *
            FROM QT_HO_TRO_HOC_PHI
            WHERE ID IN (
                SELECT MAX(ID) FROM (SELECT * FROM QT_HO_TRO_HOC_PHI ORDER BY SHCC DESC ) GROUP BY SHCC)) qththp
            LEFT JOIN TCHC_CAN_BO cb on qththp.SHCC = cb.SHCC
             LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
             LEFT JOIN DM_HO_TRO_HOC_PHI_CO_SO dmhthpcs on dmhthpcs.MA = qththp.CO_SO_DAO_TAO
             LEFT JOIN DM_CHUC_VU cv ON (cb.MA_CHUC_VU = cv.MA)
             LEFT JOIN DM_TRINH_DO td ON (cb.HOC_VI = td.MA)
             LEFT JOIN DM_NGACH_CDNN cdnn ON (cdnn.MA = cb.NGACH);

    IF pageNumber < 1 THEN pageNumber := 1; END IF;
    IF pageSize < 1 THEN pageSize := 1; END IF;
    pageTotal := CEIL(totalItem / pageSize);
    pageNumber := LEAST(pageNumber, pageTotal);

    OPEN my_cursor FOR
        SELECT *
        FROM (
                 SELECT qththp.ID               AS                  "id",
                        qththp.SHCC             AS                  "shcc",
                        (SELECT COUNT(*)
                        FROM QT_HO_TRO_HOC_PHI qththp_temp
                                 LEFT JOIN TCHC_CAN_BO cb on qththp_temp.SHCC = cb.SHCC
                                 LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
                                 LEFT JOIN DM_HO_TRO_HOC_PHI_CO_SO dmhthpcs on dmhthpcs.MA = qththp_temp.CO_SO_DAO_TAO
                                 LEFT JOIN DM_CHUC_VU cv ON (cb.MA_CHUC_VU = cv.MA)
                                 LEFT JOIN DM_TRINH_DO td ON (cb.HOC_VI = td.MA)
                                 LEFT JOIN DM_NGACH_CDNN cdnn ON (cdnn.MA = cb.NGACH)
                        WHERE (qththp_temp.SHCC = qththp.SHCC)
                            AND (((list_shcc IS NULL) AND (list_dv IS NULL) AND (fromYear IS NULL) AND (toYear IS NULL) AND (timeType = 0) AND (tinhTrang IS NULL) AND (loaiHocVi IS NULL))
                                OR (((list_shcc IS NOT NULL AND cb.SHCC IN (SELECT regexp_substr(list_shcc, '[^,]+', 1, level) from dual connect by regexp_substr(list_shcc, '[^,]+', 1, level) is not null))
                              OR (list_dv IS NOT NULL AND cb.MA_DON_VI IN (SELECT regexp_substr(list_dv, '[^,]+', 1, level) from dual connect by regexp_substr(list_dv, '[^,]+', 1, level) is not null))
                              OR (list_shcc IS NULL AND list_dv IS NULL))
                                AND (loaiHocVi IS NULL OR INSTR(loaiHocVi, cb.HOC_VI) != 0)
                                AND (timeType = 0 OR (
                                            timeType = 1 AND
                                            (qththp_temp.BAT_DAU IS NOT NULL AND (fromYear IS NULL OR qththp_temp.BAT_DAU >= fromYear)) AND
                                            (toYear IS NULL OR qththp_temp.BAT_DAU <= toYear)
                                    ) OR (
                                        timeType = 2
                                        AND (qththp_temp.NGAY_LAM_DON IS NOT NULL AND (fromYear IS NULL OR qththp_temp.NGAY_LAM_DON >= fromYear))
                                        AND (toYear IS NULL OR qththp_temp.NGAY_LAM_DON <= toYear)
                                    ))
                                AND (tinhTrang IS NULL OR ((qththp_temp.KET_THUC = -1 OR qththp_temp.KET_THUC >= today) AND tinhTrang = 2) OR
                                     (qththp_temp.KET_THUC IS NOT NULL AND qththp_temp.KET_THUC != -1 AND qththp_temp.KET_THUC < today AND tinhTrang = 1))))
                          AND (searchTerm = ''
                            OR LOWER(cb.SHCC) LIKE sT
                            OR LOWER(TRIM(cb.HO || ' ' || cb.TEN)) LIKE sT
                            OR LOWER(qththp_temp.NOI_DUNG) LIKE sT
                            OR LOWER(qththp_temp.HO_SO) LIKE sT)
                        ) AS "soQuaTrinh",

                        (select rtrim(xmlagg(xmlelement(e, qththp_temp.BAT_DAU || ' ','??').extract('//text()') order by null).getclobval(),'??')
                        FROM QT_HO_TRO_HOC_PHI qththp_temp
                                 LEFT JOIN TCHC_CAN_BO cb on qththp_temp.SHCC = cb.SHCC
                                 LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
                                 LEFT JOIN DM_HO_TRO_HOC_PHI_CO_SO dmhthpcs on dmhthpcs.MA = qththp_temp.CO_SO_DAO_TAO
                                 LEFT JOIN DM_CHUC_VU cv ON (cb.MA_CHUC_VU = cv.MA)
                                 LEFT JOIN DM_TRINH_DO td ON (cb.HOC_VI = td.MA)
                                 LEFT JOIN DM_NGACH_CDNN cdnn ON (cdnn.MA = cb.NGACH)
                        WHERE (qththp_temp.SHCC = qththp.SHCC)
                            AND (((list_shcc IS NULL) AND (list_dv IS NULL) AND (fromYear IS NULL) AND (toYear IS NULL) AND (timeType = 0) AND (tinhTrang IS NULL) AND (loaiHocVi IS NULL))
                                OR (((list_shcc IS NOT NULL AND cb.SHCC IN (SELECT regexp_substr(list_shcc, '[^,]+', 1, level) from dual connect by regexp_substr(list_shcc, '[^,]+', 1, level) is not null))
                              OR (list_dv IS NOT NULL AND cb.MA_DON_VI IN (SELECT regexp_substr(list_dv, '[^,]+', 1, level) from dual connect by regexp_substr(list_dv, '[^,]+', 1, level) is not null))
                              OR (list_shcc IS NULL AND list_dv IS NULL))
                                AND (loaiHocVi IS NULL OR INSTR(loaiHocVi, cb.HOC_VI) != 0)
                                AND (timeType = 0 OR (
                                            timeType = 1 AND
                                            (qththp_temp.BAT_DAU IS NOT NULL AND (fromYear IS NULL OR qththp_temp.BAT_DAU >= fromYear)) AND
                                            (toYear IS NULL OR qththp_temp.BAT_DAU <= toYear)
                                    ) OR (
                                        timeType = 2
                                        AND (qththp_temp.NGAY_LAM_DON IS NOT NULL AND (fromYear IS NULL OR qththp_temp.NGAY_LAM_DON >= fromYear))
                                        AND (toYear IS NULL OR qththp_temp.NGAY_LAM_DON <= toYear)
                                    ))
                                AND (tinhTrang IS NULL OR ((qththp_temp.KET_THUC = -1 OR qththp_temp.KET_THUC >= today) AND tinhTrang = 2) OR
                                     (qththp_temp.KET_THUC IS NOT NULL AND qththp_temp.KET_THUC != -1 AND qththp_temp.KET_THUC < today AND tinhTrang = 1))))
                          AND (searchTerm = ''
                            OR LOWER(cb.SHCC) LIKE sT
                            OR LOWER(TRIM(cb.HO || ' ' || cb.TEN)) LIKE sT
                            OR LOWER(qththp_temp.NOI_DUNG) LIKE sT
                            OR LOWER(qththp_temp.HO_SO) LIKE sT)
                        ) AS "danhSachBatDau",

                        (select rtrim(xmlagg(xmlelement(e, qththp_temp.BAT_DAU_TYPE || ' ','??').extract('//text()') order by null).getclobval(),'??')
                        FROM QT_HO_TRO_HOC_PHI qththp_temp
                                 LEFT JOIN TCHC_CAN_BO cb on qththp_temp.SHCC = cb.SHCC
                                 LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
                                 LEFT JOIN DM_HO_TRO_HOC_PHI_CO_SO dmhthpcs on dmhthpcs.MA = qththp_temp.CO_SO_DAO_TAO
                                 LEFT JOIN DM_CHUC_VU cv ON (cb.MA_CHUC_VU = cv.MA)
                                 LEFT JOIN DM_TRINH_DO td ON (cb.HOC_VI = td.MA)
                                 LEFT JOIN DM_NGACH_CDNN cdnn ON (cdnn.MA = cb.NGACH)
                        WHERE (qththp_temp.SHCC = qththp.SHCC)
                            AND (((list_shcc IS NULL) AND (list_dv IS NULL) AND (fromYear IS NULL) AND (toYear IS NULL) AND (timeType = 0) AND (tinhTrang IS NULL) AND (loaiHocVi IS NULL))
                                OR (((list_shcc IS NOT NULL AND cb.SHCC IN (SELECT regexp_substr(list_shcc, '[^,]+', 1, level) from dual connect by regexp_substr(list_shcc, '[^,]+', 1, level) is not null))
                              OR (list_dv IS NOT NULL AND cb.MA_DON_VI IN (SELECT regexp_substr(list_dv, '[^,]+', 1, level) from dual connect by regexp_substr(list_dv, '[^,]+', 1, level) is not null))
                              OR (list_shcc IS NULL AND list_dv IS NULL))
                                AND (loaiHocVi IS NULL OR INSTR(loaiHocVi, cb.HOC_VI) != 0)
                                AND (timeType = 0 OR (
                                            timeType = 1 AND
                                            (qththp_temp.BAT_DAU IS NOT NULL AND (fromYear IS NULL OR qththp_temp.BAT_DAU >= fromYear)) AND
                                            (toYear IS NULL OR qththp_temp.BAT_DAU <= toYear)
                                    ) OR (
                                        timeType = 2
                                        AND (qththp_temp.NGAY_LAM_DON IS NOT NULL AND (fromYear IS NULL OR qththp_temp.NGAY_LAM_DON >= fromYear))
                                        AND (toYear IS NULL OR qththp_temp.NGAY_LAM_DON <= toYear)
                                    ))
                                AND (tinhTrang IS NULL OR ((qththp_temp.KET_THUC = -1 OR qththp_temp.KET_THUC >= today) AND tinhTrang = 2) OR
                                     (qththp_temp.KET_THUC IS NOT NULL AND qththp_temp.KET_THUC != -1 AND qththp_temp.KET_THUC < today AND tinhTrang = 1))))
                          AND (searchTerm = ''
                            OR LOWER(cb.SHCC) LIKE sT
                            OR LOWER(TRIM(cb.HO || ' ' || cb.TEN)) LIKE sT
                            OR LOWER(qththp_temp.NOI_DUNG) LIKE sT
                            OR LOWER(qththp_temp.HO_SO) LIKE sT)
                        ) AS "danhSachBatDauType",

                        (select rtrim(xmlagg(xmlelement(e, qththp_temp.KET_THUC || ' ','??').extract('//text()') order by null).getclobval(),'??')
                        FROM QT_HO_TRO_HOC_PHI qththp_temp
                                 LEFT JOIN TCHC_CAN_BO cb on qththp_temp.SHCC = cb.SHCC
                                 LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
                                 LEFT JOIN DM_HO_TRO_HOC_PHI_CO_SO dmhthpcs on dmhthpcs.MA = qththp_temp.CO_SO_DAO_TAO
                                 LEFT JOIN DM_CHUC_VU cv ON (cb.MA_CHUC_VU = cv.MA)
                                 LEFT JOIN DM_TRINH_DO td ON (cb.HOC_VI = td.MA)
                                 LEFT JOIN DM_NGACH_CDNN cdnn ON (cdnn.MA = cb.NGACH)
                        WHERE (qththp_temp.SHCC = qththp.SHCC)
                            AND (((list_shcc IS NULL) AND (list_dv IS NULL) AND (fromYear IS NULL) AND (toYear IS NULL) AND (timeType = 0) AND (tinhTrang IS NULL) AND (loaiHocVi IS NULL))
                                OR (((list_shcc IS NOT NULL AND cb.SHCC IN (SELECT regexp_substr(list_shcc, '[^,]+', 1, level) from dual connect by regexp_substr(list_shcc, '[^,]+', 1, level) is not null))
                              OR (list_dv IS NOT NULL AND cb.MA_DON_VI IN (SELECT regexp_substr(list_dv, '[^,]+', 1, level) from dual connect by regexp_substr(list_dv, '[^,]+', 1, level) is not null))
                              OR (list_shcc IS NULL AND list_dv IS NULL))
                                AND (loaiHocVi IS NULL OR INSTR(loaiHocVi, cb.HOC_VI) != 0)
                                AND (timeType = 0 OR (
                                            timeType = 1 AND
                                            (qththp_temp.BAT_DAU IS NOT NULL AND (fromYear IS NULL OR qththp_temp.BAT_DAU >= fromYear)) AND
                                            (toYear IS NULL OR qththp_temp.BAT_DAU <= toYear)
                                    ) OR (
                                        timeType = 2
                                        AND (qththp_temp.NGAY_LAM_DON IS NOT NULL AND (fromYear IS NULL OR qththp_temp.NGAY_LAM_DON >= fromYear))
                                        AND (toYear IS NULL OR qththp_temp.NGAY_LAM_DON <= toYear)
                                    ))
                                AND (tinhTrang IS NULL OR ((qththp_temp.KET_THUC = -1 OR qththp_temp.KET_THUC >= today) AND tinhTrang = 2) OR
                                     (qththp_temp.KET_THUC IS NOT NULL AND qththp_temp.KET_THUC != -1 AND qththp_temp.KET_THUC < today AND tinhTrang = 1))))
                          AND (searchTerm = ''
                            OR LOWER(cb.SHCC) LIKE sT
                            OR LOWER(TRIM(cb.HO || ' ' || cb.TEN)) LIKE sT
                            OR LOWER(qththp_temp.NOI_DUNG) LIKE sT
                            OR LOWER(qththp_temp.HO_SO) LIKE sT)
                        ) AS "danhSachKetThuc",

                        (select rtrim(xmlagg(xmlelement(e, qththp_temp.KET_THUC_TYPE || ' ','??').extract('//text()') order by null).getclobval(),'??')
                        FROM QT_HO_TRO_HOC_PHI qththp_temp
                                 LEFT JOIN TCHC_CAN_BO cb on qththp_temp.SHCC = cb.SHCC
                                 LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
                                 LEFT JOIN DM_HO_TRO_HOC_PHI_CO_SO dmhthpcs on dmhthpcs.MA = qththp_temp.CO_SO_DAO_TAO
                                 LEFT JOIN DM_CHUC_VU cv ON (cb.MA_CHUC_VU = cv.MA)
                                 LEFT JOIN DM_TRINH_DO td ON (cb.HOC_VI = td.MA)
                                 LEFT JOIN DM_NGACH_CDNN cdnn ON (cdnn.MA = cb.NGACH)
                        WHERE (qththp_temp.SHCC = qththp.SHCC)
                            AND (((list_shcc IS NULL) AND (list_dv IS NULL) AND (fromYear IS NULL) AND (toYear IS NULL) AND (timeType = 0) AND (tinhTrang IS NULL) AND (loaiHocVi IS NULL))
                                OR (((list_shcc IS NOT NULL AND cb.SHCC IN (SELECT regexp_substr(list_shcc, '[^,]+', 1, level) from dual connect by regexp_substr(list_shcc, '[^,]+', 1, level) is not null))
                              OR (list_dv IS NOT NULL AND cb.MA_DON_VI IN (SELECT regexp_substr(list_dv, '[^,]+', 1, level) from dual connect by regexp_substr(list_dv, '[^,]+', 1, level) is not null))
                              OR (list_shcc IS NULL AND list_dv IS NULL))
                                AND (loaiHocVi IS NULL OR INSTR(loaiHocVi, cb.HOC_VI) != 0)
                                AND (timeType = 0 OR (
                                            timeType = 1 AND
                                            (qththp_temp.BAT_DAU IS NOT NULL AND (fromYear IS NULL OR qththp_temp.BAT_DAU >= fromYear)) AND
                                            (toYear IS NULL OR qththp_temp.BAT_DAU <= toYear)
                                    ) OR (
                                        timeType = 2
                                        AND (qththp_temp.NGAY_LAM_DON IS NOT NULL AND (fromYear IS NULL OR qththp_temp.NGAY_LAM_DON >= fromYear))
                                        AND (toYear IS NULL OR qththp_temp.NGAY_LAM_DON <= toYear)
                                    ))
                                AND (tinhTrang IS NULL OR ((qththp_temp.KET_THUC = -1 OR qththp_temp.KET_THUC >= today) AND tinhTrang = 2) OR
                                     (qththp_temp.KET_THUC IS NOT NULL AND qththp_temp.KET_THUC != -1 AND qththp_temp.KET_THUC < today AND tinhTrang = 1))))
                          AND (searchTerm = ''
                            OR LOWER(cb.SHCC) LIKE sT
                            OR LOWER(TRIM(cb.HO || ' ' || cb.TEN)) LIKE sT
                            OR LOWER(qththp_temp.NOI_DUNG) LIKE sT
                            OR LOWER(qththp_temp.HO_SO) LIKE sT)
                        ) AS "danhSachKetThucType",

                        (select rtrim(xmlagg(xmlelement(e, qththp_temp.NOI_DUNG || ' ','??').extract('//text()') order by null).getclobval(),'??')
                        FROM QT_HO_TRO_HOC_PHI qththp_temp
                                 LEFT JOIN TCHC_CAN_BO cb on qththp_temp.SHCC = cb.SHCC
                                 LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
                                 LEFT JOIN DM_HO_TRO_HOC_PHI_CO_SO dmhthpcs on dmhthpcs.MA = qththp_temp.CO_SO_DAO_TAO
                                 LEFT JOIN DM_CHUC_VU cv ON (cb.MA_CHUC_VU = cv.MA)
                                 LEFT JOIN DM_TRINH_DO td ON (cb.HOC_VI = td.MA)
                                 LEFT JOIN DM_NGACH_CDNN cdnn ON (cdnn.MA = cb.NGACH)
                        WHERE (qththp_temp.SHCC = qththp.SHCC)
                            AND (((list_shcc IS NULL) AND (list_dv IS NULL) AND (fromYear IS NULL) AND (toYear IS NULL) AND (timeType = 0) AND (tinhTrang IS NULL) AND (loaiHocVi IS NULL))
                                OR (((list_shcc IS NOT NULL AND cb.SHCC IN (SELECT regexp_substr(list_shcc, '[^,]+', 1, level) from dual connect by regexp_substr(list_shcc, '[^,]+', 1, level) is not null))
                              OR (list_dv IS NOT NULL AND cb.MA_DON_VI IN (SELECT regexp_substr(list_dv, '[^,]+', 1, level) from dual connect by regexp_substr(list_dv, '[^,]+', 1, level) is not null))
                              OR (list_shcc IS NULL AND list_dv IS NULL))
                                AND (loaiHocVi IS NULL OR INSTR(loaiHocVi, cb.HOC_VI) != 0)
                                AND (timeType = 0 OR (
                                            timeType = 1 AND
                                            (qththp_temp.BAT_DAU IS NOT NULL AND (fromYear IS NULL OR qththp_temp.BAT_DAU >= fromYear)) AND
                                            (toYear IS NULL OR qththp_temp.BAT_DAU <= toYear)
                                    ) OR (
                                        timeType = 2
                                        AND (qththp_temp.NGAY_LAM_DON IS NOT NULL AND (fromYear IS NULL OR qththp_temp.NGAY_LAM_DON >= fromYear))
                                        AND (toYear IS NULL OR qththp_temp.NGAY_LAM_DON <= toYear)
                                    ))
                                AND (tinhTrang IS NULL OR ((qththp_temp.KET_THUC = -1 OR qththp_temp.KET_THUC >= today) AND tinhTrang = 2) OR
                                     (qththp_temp.KET_THUC IS NOT NULL AND qththp_temp.KET_THUC != -1 AND qththp_temp.KET_THUC < today AND tinhTrang = 1))))
                          AND (searchTerm = ''
                            OR LOWER(cb.SHCC) LIKE sT
                            OR LOWER(TRIM(cb.HO || ' ' || cb.TEN)) LIKE sT
                            OR LOWER(qththp_temp.NOI_DUNG) LIKE sT
                            OR LOWER(qththp_temp.HO_SO) LIKE sT)
                        ) AS "danhSachNoiDung",

                        today                 AS                  "today",
                        cb.HO                 AS                  "hoCanBo",
                        cb.TEN                AS                  "tenCanBo",

                        dv.MA                 AS                  "maDonVi",
                        dv.TEN                AS                  "tenDonVi",
                        cv.MA   AS "maChucVu",
                        cv.TEN  AS "tenChucVu",
                        cb.CHUYEN_NGANH AS "tenChuyenNganh",

                        td.MA   AS "maHocVi",
                        td.TEN  AS "tenHocVi",

                        cdnn.MA AS "maChucDanhNgheNghiep",
                        cdnn.TEN AS "tenChucDanhNgheNghiep",

                        ROW_NUMBER() OVER (ORDER BY BAT_DAU DESC) R
                FROM (SELECT *
                        FROM QT_HO_TRO_HOC_PHI
                        WHERE ID IN (
                            SELECT MAX(ID) FROM (SELECT * FROM QT_HO_TRO_HOC_PHI ORDER BY SHCC DESC ) GROUP BY SHCC)) qththp
                        LEFT JOIN TCHC_CAN_BO cb on qththp.SHCC = cb.SHCC
                         LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
                         LEFT JOIN DM_HO_TRO_HOC_PHI_CO_SO dmhthpcs on dmhthpcs.MA = qththp.CO_SO_DAO_TAO
                         LEFT JOIN DM_CHUC_VU cv ON (cb.MA_CHUC_VU = cv.MA)
                         LEFT JOIN DM_TRINH_DO td ON (cb.HOC_VI = td.MA)
                         LEFT JOIN DM_NGACH_CDNN cdnn ON (cdnn.MA = cb.NGACH)
                 ORDER BY qththp.BAT_DAU DESC
             )
        WHERE R BETWEEN (pageNumber - 1) * pageSize + 1 AND pageNumber * pageSize;
    RETURN my_cursor;

END;

/
--EndMethod--

CREATE OR REPLACE FUNCTION QT_HO_TRO_HOC_PHI_SEARCH_PAGE(pageNumber IN OUT NUMBER, pageSize IN OUT NUMBER,
                                          list_shcc IN STRING, list_dv IN STRING,
                                          fromYear IN NUMBER, toYear IN NUMBER, timeType IN NUMBER, tinhTrang IN NUMBER,
                                          loaiHocVi IN STRING, searchTerm IN STRING,
                                          totalItem OUT NUMBER, pageTotal OUT NUMBER) RETURN SYS_REFCURSOR
AS
    my_cursor SYS_REFCURSOR;
    sT        STRING(500) := '%' || lower(searchTerm) || '%';
    today     NUMBER(20);
BEGIN
    select (cast(sysdate as date) - cast(to_date('1970-01-01', 'YYYY-MM-DD') as date)) * 86400000 into today from dual;
    SELECT COUNT(*)
    INTO totalItem

    FROM QT_HO_TRO_HOC_PHI qththp
             LEFT JOIN TCHC_CAN_BO cb on qththp.SHCC = cb.SHCC
             LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
             LEFT JOIN DM_HO_TRO_HOC_PHI_CO_SO dmhthpcs on dmhthpcs.MA = qththp.CO_SO_DAO_TAO
             LEFT JOIN DM_CHUC_VU cv ON (cb.MA_CHUC_VU = cv.MA)
             LEFT JOIN DM_TRINH_DO td ON (cb.HOC_VI = td.MA)
             LEFT JOIN DM_NGACH_CDNN cdnn ON (cdnn.MA = cb.NGACH)
    WHERE (((list_shcc IS NULL) AND (list_dv IS NULL) AND (fromYear IS NULL) AND (toYear IS NULL) AND (timeType = 0) AND (tinhTrang IS NULL) AND (loaiHocVi IS NULL))
        OR (((list_shcc IS NOT NULL AND cb.SHCC IN (SELECT regexp_substr(list_shcc, '[^,]+', 1, level) from dual connect by regexp_substr(list_shcc, '[^,]+', 1, level) is not null))
      OR (list_dv IS NOT NULL AND cb.MA_DON_VI IN (SELECT regexp_substr(list_dv, '[^,]+', 1, level) from dual connect by regexp_substr(list_dv, '[^,]+', 1, level) is not null))
      OR (list_shcc IS NULL AND list_dv IS NULL))
            AND (loaiHocVi IS NULL OR INSTR(loaiHocVi, cb.HOC_VI) != 0)
            AND (timeType = 0 OR (
                        timeType = 1 AND
                        (qththp.BAT_DAU IS NOT NULL AND (fromYear IS NULL OR qththp.BAT_DAU >= fromYear)) AND
                        (toYear IS NULL OR qththp.BAT_DAU <= toYear)
                ) OR (
                    timeType = 2
                    AND (qththp.NGAY_LAM_DON IS NOT NULL AND (fromYear IS NULL OR qththp.NGAY_LAM_DON >= fromYear))
                    AND (toYear IS NULL OR qththp.NGAY_LAM_DON <= toYear)
                ))
            AND (tinhTrang IS NULL OR ((qththp.KET_THUC = -1 OR qththp.KET_THUC >= today) AND tinhTrang = 2) OR
                 (qththp.KET_THUC IS NOT NULL AND qththp.KET_THUC != -1 AND qththp.KET_THUC < today AND tinhTrang = 1))))
      AND (searchTerm = ''
        OR LOWER(cb.SHCC) LIKE sT
        OR LOWER(TRIM(cb.HO || ' ' || cb.TEN)) LIKE sT
        OR LOWER(qththp.NOI_DUNG) LIKE sT
        OR LOWER(qththp.HO_SO) LIKE sT);

    IF pageNumber < 1 THEN pageNumber := 1; END IF;
    IF pageSize < 1 THEN pageSize := 1; END IF;
    pageTotal := CEIL(totalItem / pageSize);
    pageNumber := LEAST(pageNumber, pageTotal);

    OPEN my_cursor FOR
        SELECT *
        FROM (
                 SELECT qththp.ID               AS                  "id",
                        qththp.SHCC             AS                  "shcc",
                        qththp.BAT_DAU   AS "batDau",
                        qththp.BAT_DAU_TYPE  AS "batDauType",
                        qththp.KET_THUC   AS "ketThuc",
                        qththp.KET_THUC_TYPE  AS "ketThucType",
                        qththp.GHI_CHU   AS "ghiChu",
                        qththp.HO_SO AS "hoSo",
                        qththp.NGAY_LAM_DON   AS "ngayLamDon",
                        qththp.NOI_DUNG   AS "noiDung",
                        qththp.SO_TIEN   AS "soTien",
                        qththp.CO_SO_DAO_TAO   AS "coSoDaoTao",
                        qththp.HOC_KY_HO_TRO AS "hocKyHoTro",

                        today                 AS                  "today",
                        cb.HO                 AS                  "hoCanBo",
                        cb.TEN                AS                  "tenCanBo",

                        dv.MA                 AS                  "maDonVi",
                        dv.TEN                AS                  "tenDonVi",
                        cv.MA   AS "maChucVu",
                        cv.TEN  AS "tenChucVu",
                        cb.CHUYEN_NGANH AS "tenChuyenNganh",

                        td.MA   AS "maHocVi",
                        td.TEN  AS "tenHocVi",

                        cdnn.MA AS "maChucDanhNgheNghiep",
                        cdnn.TEN AS "tenChucDanhNgheNghiep",

                        dmhthpcs.TEN    AS "tenCoSoDaoTao",
                        ROW_NUMBER() OVER (ORDER BY BAT_DAU DESC) R
                FROM QT_HO_TRO_HOC_PHI qththp
                         LEFT JOIN TCHC_CAN_BO cb on qththp.SHCC = cb.SHCC
                         LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
                         LEFT JOIN DM_HO_TRO_HOC_PHI_CO_SO dmhthpcs on dmhthpcs.MA = qththp.CO_SO_DAO_TAO
                         LEFT JOIN DM_CHUC_VU cv ON (cb.MA_CHUC_VU = cv.MA)
                         LEFT JOIN DM_TRINH_DO td ON (cb.HOC_VI = td.MA)
                         LEFT JOIN DM_NGACH_CDNN cdnn ON (cdnn.MA = cb.NGACH)
                WHERE (((list_shcc IS NULL) AND (list_dv IS NULL) AND (fromYear IS NULL) AND (toYear IS NULL) AND (timeType = 0) AND (tinhTrang IS NULL) AND (loaiHocVi IS NULL))
                    OR (((list_shcc IS NOT NULL AND cb.SHCC IN (SELECT regexp_substr(list_shcc, '[^,]+', 1, level) from dual connect by regexp_substr(list_shcc, '[^,]+', 1, level) is not null))
                  OR (list_dv IS NOT NULL AND cb.MA_DON_VI IN (SELECT regexp_substr(list_dv, '[^,]+', 1, level) from dual connect by regexp_substr(list_dv, '[^,]+', 1, level) is not null))
                  OR (list_shcc IS NULL AND list_dv IS NULL))
                        AND (loaiHocVi IS NULL OR INSTR(loaiHocVi, cb.HOC_VI) != 0)
                        AND (timeType = 0 OR (
                                    timeType = 1 AND
                                    (qththp.BAT_DAU IS NOT NULL AND (fromYear IS NULL OR qththp.BAT_DAU >= fromYear)) AND
                                    (toYear IS NULL OR qththp.BAT_DAU <= toYear)
                            ) OR (
                                timeType = 2
                                AND (qththp.NGAY_LAM_DON IS NOT NULL AND (fromYear IS NULL OR qththp.NGAY_LAM_DON >= fromYear))
                                AND (toYear IS NULL OR qththp.NGAY_LAM_DON <= toYear)
                            ))
                        AND (tinhTrang IS NULL OR ((qththp.KET_THUC = -1 OR qththp.KET_THUC >= today) AND tinhTrang = 2) OR
                             (qththp.KET_THUC IS NOT NULL AND qththp.KET_THUC != -1 AND qththp.KET_THUC < today AND tinhTrang = 1))))
                  AND (searchTerm = ''
                    OR LOWER(cb.SHCC) LIKE sT
                    OR LOWER(TRIM(cb.HO || ' ' || cb.TEN)) LIKE sT
                    OR LOWER(qththp.NOI_DUNG) LIKE sT
                    OR LOWER(qththp.HO_SO) LIKE sT)
                 ORDER BY qththp.BAT_DAU DESC
             )
        WHERE R BETWEEN (pageNumber - 1) * pageSize + 1 AND pageNumber * pageSize;
    RETURN my_cursor;

END;

/
--EndMethod--

CREATE OR REPLACE FUNCTION QT_HUONG_DAN_LUAN_VAN_GROUP_PAGE(pageNumber IN OUT NUMBER, pageSize IN OUT NUMBER,
                                        list_shcc IN STRING, list_dv IN STRING,
                                        fromYear IN NUMBER, toYear IN NUMBER, searchTerm IN STRING,
                                         totalItem OUT NUMBER, pageTotal OUT NUMBER) RETURN SYS_REFCURSOR
AS
    my_cursor SYS_REFCURSOR;
    sT        STRING(500) := '%' || lower(searchTerm) || '%';
BEGIN
    SELECT COUNT(*)
    INTO totalItem

    FROM (SELECT *
            FROM QT_HUONG_DAN_LUAN_VAN
            WHERE ID IN (
                SELECT MAX(ID) FROM (SELECT * FROM QT_HUONG_DAN_LUAN_VAN ORDER BY SHCC DESC ) GROUP BY SHCC)) hdlv
            LEFT JOIN TCHC_CAN_BO cb on hdlv.SHCC = cb.SHCC
            LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
            LEFT JOIN DM_TRINH_DO td ON (cb.HOC_VI = td.MA)
            LEFT JOIN DM_NGACH_CDNN cdnn ON (cdnn.MA = cb.NGACH);

    IF pageNumber < 1 THEN pageNumber := 1; END IF;
    IF pageSize < 1 THEN pageSize := 1; END IF;
    pageTotal := CEIL(totalItem / pageSize);
    pageNumber := LEAST(pageNumber, pageTotal);

    OPEN my_cursor FOR
        SELECT *
        FROM (
                 SELECT hdlv.ID             AS               "id",
                        hdlv.SHCC           AS  "shcc",
                        cb.HO               AS               "hoCanBo",
                        cb.TEN              AS               "tenCanBo",
                        (SELECT COUNT(*)
                         FROM QT_HUONG_DAN_LUAN_VAN hdlv_temp
                            LEFT JOIN TCHC_CAN_BO cb on hdlv_temp.SHCC = cb.SHCC
                            LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
                         WHERE hdlv_temp.SHCC = hdlv.SHCC
                             AND (((list_shcc IS NULL) AND (list_dv IS NULL) AND (fromYear IS NULL) AND (toYear IS NULL))
                            OR (((list_shcc IS NOT NULL AND cb.SHCC IN (SELECT regexp_substr(list_shcc, '[^,]+', 1, level) from dual connect by regexp_substr(list_shcc, '[^,]+', 1, level) is not null))
                          OR (list_dv IS NOT NULL AND cb.MA_DON_VI IN (SELECT regexp_substr(list_dv, '[^,]+', 1, level) from dual connect by regexp_substr(list_dv, '[^,]+', 1, level) is not null))
                          OR (list_shcc IS NULL AND list_dv IS NULL))
                          AND (hdlv_temp.NAM_TOT_NGHIEP IS NOT NULL AND (fromYear IS NULL OR hdlv_temp.NAM_TOT_NGHIEP >= fromYear))
                          AND (hdlv_temp.NAM_TOT_NGHIEP IS NOT NULL AND (toYear IS NULL OR hdlv_temp.NAM_TOT_NGHIEP <= toYear))))
                          AND (searchTerm = ''
                            OR LOWER(cb.SHCC) LIKE sT
                            OR LOWER(TRIM(cb.HO || ' ' || cb.TEN)) LIKE sT
                            OR LOWER(hdlv_temp.TEN_LUAN_VAN) LIKE sT
                            OR LOWER(hdlv_temp.SAN_PHAM) LIKE sT)
                        ) AS "soDeTai",

                        (select rtrim(xmlagg(xmlelement(e, hdlv_temp.HO_TEN || ' ','??').extract('//text()') order by null).getclobval(),'??')
                         FROM QT_HUONG_DAN_LUAN_VAN hdlv_temp
                            LEFT JOIN TCHC_CAN_BO cb on hdlv_temp.SHCC = cb.SHCC
                            LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
                         WHERE hdlv_temp.SHCC = hdlv.SHCC
                             AND (((list_shcc IS NULL) AND (list_dv IS NULL) AND (fromYear IS NULL) AND (toYear IS NULL))
                            OR (((list_shcc IS NOT NULL AND cb.SHCC IN (SELECT regexp_substr(list_shcc, '[^,]+', 1, level) from dual connect by regexp_substr(list_shcc, '[^,]+', 1, level) is not null))
                          OR (list_dv IS NOT NULL AND cb.MA_DON_VI IN (SELECT regexp_substr(list_dv, '[^,]+', 1, level) from dual connect by regexp_substr(list_dv, '[^,]+', 1, level) is not null))
                          OR (list_shcc IS NULL AND list_dv IS NULL))
                          AND (hdlv_temp.NAM_TOT_NGHIEP IS NOT NULL AND (fromYear IS NULL OR hdlv_temp.NAM_TOT_NGHIEP >= fromYear))
                          AND (hdlv_temp.NAM_TOT_NGHIEP IS NOT NULL AND (toYear IS NULL OR hdlv_temp.NAM_TOT_NGHIEP <= toYear))))
                          AND (searchTerm = ''
                            OR LOWER(cb.SHCC) LIKE sT
                            OR LOWER(TRIM(cb.HO || ' ' || cb.TEN)) LIKE sT
                            OR LOWER(hdlv_temp.TEN_LUAN_VAN) LIKE sT
                            OR LOWER(hdlv_temp.SAN_PHAM) LIKE sT)
                        ) AS "danhSachHoTen",

                        (select rtrim(xmlagg(xmlelement(e, hdlv_temp.TEN_LUAN_VAN || ' ','??').extract('//text()') order by null).getclobval(),'??')
                         FROM QT_HUONG_DAN_LUAN_VAN hdlv_temp
                            LEFT JOIN TCHC_CAN_BO cb on hdlv_temp.SHCC = cb.SHCC
                            LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
                         WHERE hdlv_temp.SHCC = hdlv.SHCC
                             AND (((list_shcc IS NULL) AND (list_dv IS NULL) AND (fromYear IS NULL) AND (toYear IS NULL))
                            OR (((list_shcc IS NOT NULL AND cb.SHCC IN (SELECT regexp_substr(list_shcc, '[^,]+', 1, level) from dual connect by regexp_substr(list_shcc, '[^,]+', 1, level) is not null))
                          OR (list_dv IS NOT NULL AND cb.MA_DON_VI IN (SELECT regexp_substr(list_dv, '[^,]+', 1, level) from dual connect by regexp_substr(list_dv, '[^,]+', 1, level) is not null))
                          OR (list_shcc IS NULL AND list_dv IS NULL))
                          AND (hdlv_temp.NAM_TOT_NGHIEP IS NOT NULL AND (fromYear IS NULL OR hdlv_temp.NAM_TOT_NGHIEP >= fromYear))
                          AND (hdlv_temp.NAM_TOT_NGHIEP IS NOT NULL AND (toYear IS NULL OR hdlv_temp.NAM_TOT_NGHIEP <= toYear))))
                          AND (searchTerm = ''
                            OR LOWER(cb.SHCC) LIKE sT
                            OR LOWER(TRIM(cb.HO || ' ' || cb.TEN)) LIKE sT
                            OR LOWER(hdlv_temp.TEN_LUAN_VAN) LIKE sT
                            OR LOWER(hdlv_temp.SAN_PHAM) LIKE sT)
                        ) AS "danhSachDeTai",

                        (select rtrim(xmlagg(xmlelement(e, hdlv_temp.NAM_TOT_NGHIEP || ' ','??').extract('//text()') order by null).getclobval(),'??')
                         FROM QT_HUONG_DAN_LUAN_VAN hdlv_temp
                            LEFT JOIN TCHC_CAN_BO cb on hdlv_temp.SHCC = cb.SHCC
                            LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
                         WHERE hdlv_temp.SHCC = hdlv.SHCC
                             AND (((list_shcc IS NULL) AND (list_dv IS NULL) AND (fromYear IS NULL) AND (toYear IS NULL))
                            OR (((list_shcc IS NOT NULL AND cb.SHCC IN (SELECT regexp_substr(list_shcc, '[^,]+', 1, level) from dual connect by regexp_substr(list_shcc, '[^,]+', 1, level) is not null))
                          OR (list_dv IS NOT NULL AND cb.MA_DON_VI IN (SELECT regexp_substr(list_dv, '[^,]+', 1, level) from dual connect by regexp_substr(list_dv, '[^,]+', 1, level) is not null))
                          OR (list_shcc IS NULL AND list_dv IS NULL))
                          AND (hdlv_temp.NAM_TOT_NGHIEP IS NOT NULL AND (fromYear IS NULL OR hdlv_temp.NAM_TOT_NGHIEP >= fromYear))
                          AND (hdlv_temp.NAM_TOT_NGHIEP IS NOT NULL AND (toYear IS NULL OR hdlv_temp.NAM_TOT_NGHIEP <= toYear))))
                          AND (searchTerm = ''
                            OR LOWER(cb.SHCC) LIKE sT
                            OR LOWER(TRIM(cb.HO || ' ' || cb.TEN)) LIKE sT
                            OR LOWER(hdlv_temp.TEN_LUAN_VAN) LIKE sT
                            OR LOWER(hdlv_temp.SAN_PHAM) LIKE sT)
                        ) AS "danhSachNamTotNghiep",
                        dv.MA               AS               "maDonVi",
                        dv.TEN              AS               "tenDonVi",

                      (SELECT DMCV.TEN
                      FROM QT_CHUC_VU QTCV
                               LEFT JOIN DM_CHUC_VU DMCV ON DMCV.MA = QTCV.MA_CHUC_VU
                      WHERE QTCV.SHCC = CB.SHCC
                        AND CHUC_VU_CHINH = 1)                        AS "tenChucVu",

                     (SELECT QTCV.MA_CHUC_VU
                      FROM QT_CHUC_VU QTCV
                      WHERE QTCV.SHCC = CB.SHCC
                        AND CHUC_VU_CHINH = 1)                        AS "maChucVu",
                        td.MA   AS "maHocVi",
                        td.TEN  AS "tenHocVi",

                        cdnn.MA AS "maChucDanhNgheNghiep",
                        cdnn.TEN AS "tenChucDanhNgheNghiep",

                        ROW_NUMBER() OVER (ORDER BY hdlv.NAM_TOT_NGHIEP DESC, hdlv.SHCC DESC) R
                FROM (SELECT *
                        FROM QT_HUONG_DAN_LUAN_VAN
                        WHERE ID IN (
                            SELECT MAX(ID) FROM (SELECT * FROM QT_HUONG_DAN_LUAN_VAN ORDER BY SHCC DESC ) GROUP BY SHCC)) hdlv
                        LEFT JOIN TCHC_CAN_BO cb on hdlv.SHCC = cb.SHCC
                        LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
                        LEFT JOIN DM_TRINH_DO td ON (cb.HOC_VI = td.MA)
                        LEFT JOIN DM_NGACH_CDNN cdnn ON (cdnn.MA = cb.NGACH)
                 ORDER BY hdlv.NAM_TOT_NGHIEP DESC, hdlv.SHCC DESC
             )
        WHERE R BETWEEN (pageNumber - 1) * pageSize + 1 AND pageNumber * pageSize;
    RETURN my_cursor;
END;

/
--EndMethod--

CREATE OR REPLACE FUNCTION QT_HUONG_DAN_LUAN_VAN_SEARCH_PAGE(pageNumber IN OUT NUMBER, pageSize IN OUT NUMBER,
                                                  list_shcc IN STRING, list_dv IN STRING,
                                                  fromYear IN NUMBER, toYear IN NUMBER, searchTerm IN STRING,
                                                  totalItem OUT NUMBER, pageTotal OUT NUMBER) RETURN SYS_REFCURSOR
AS
    my_cursor SYS_REFCURSOR;
    sT        STRING(500) := '%' || lower(searchTerm) || '%';
BEGIN
    SELECT COUNT(*)
    INTO totalItem

    FROM QT_HUONG_DAN_LUAN_VAN hdlv
             LEFT JOIN TCHC_CAN_BO cb on hdlv.SHCC = cb.SHCC
             LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
             LEFT JOIN DM_TRINH_DO td ON (cb.HOC_VI = td.MA)
             LEFT JOIN DM_NGACH_CDNN cdnn ON (cdnn.MA = cb.NGACH)
    WHERE (((list_shcc IS NULL) AND (list_dv IS NULL) AND (fromYear IS NULL) AND (toYear IS NULL))
        OR (((list_shcc IS NOT NULL AND cb.SHCC IN (SELECT regexp_substr(list_shcc, '[^,]+', 1, level)
                                                    from dual
                                                    connect by regexp_substr(list_shcc, '[^,]+', 1, level) is not null))
            OR (list_dv IS NOT NULL AND cb.MA_DON_VI IN (SELECT regexp_substr(list_dv, '[^,]+', 1, level)
                                                         from dual
                                                         connect by regexp_substr(list_dv, '[^,]+', 1, level) is not null))
            OR (list_shcc IS NULL AND list_dv IS NULL))
            AND (hdlv.NAM_TOT_NGHIEP IS NOT NULL AND (fromYear IS NULL OR hdlv.NAM_TOT_NGHIEP >= fromYear))
            AND (hdlv.NAM_TOT_NGHIEP IS NOT NULL AND (toYear IS NULL OR hdlv.NAM_TOT_NGHIEP <= toYear))))
      AND (searchTerm = ''
        OR LOWER(cb.SHCC) LIKE sT
        OR LOWER(TRIM(cb.HO || ' ' || cb.TEN)) LIKE sT
        OR LOWER(hdlv.TEN_LUAN_VAN) LIKE sT
        OR LOWER(hdlv.SAN_PHAM) LIKE sT);

    IF pageNumber < 1 THEN pageNumber := 1; END IF;
    IF pageSize < 1 THEN pageSize := 1; END IF;
    pageTotal := CEIL(totalItem / pageSize);
    pageNumber := LEAST(pageNumber, pageTotal);

    OPEN my_cursor FOR
        SELECT *
        FROM (SELECT hdlv.ID                   AS                          "id",
                     hdlv.TEN_LUAN_VAN         AS                          "tenLuanVan",
                     hdlv.HO_TEN               AS                          "hoTen",
                     hdlv.SHCC                 as                          "shcc",
                     hdlv.NAM_TOT_NGHIEP       AS                          "namTotNghiep",
                     hdlv.BAC_DAO_TAO          AS                          "bacDaoTao",
                     hdlv.SAN_PHAM             AS                          "sanPham",
                     cb.HO                     AS                          "hoCanBo",
                     cb.TEN                    AS                          "tenCanBo",

                     dv.MA                     AS                          "maDonVi",
                     dv.TEN                    AS                          "tenDonVi",

                     (SELECT DMCV.TEN
                      FROM QT_CHUC_VU QTCV
                               LEFT JOIN DM_CHUC_VU DMCV ON DMCV.MA = QTCV.MA_CHUC_VU
                      WHERE QTCV.SHCC = CB.SHCC
                        AND CHUC_VU_CHINH = 1) AS                          "tenChucVu",

                     (SELECT QTCV.MA_CHUC_VU
                      FROM QT_CHUC_VU QTCV
                      WHERE QTCV.SHCC = CB.SHCC
                        AND CHUC_VU_CHINH = 1) AS                          "maChucVu",
                     td.MA                     AS                          "maHocVi",
                     td.TEN                    AS                          "tenHocVi",

                     cdnn.MA                   AS                          "maChucDanhNgheNghiep",
                     cdnn.TEN                  AS                          "tenChucDanhNgheNghiep",
                     ROW_NUMBER() OVER (ORDER BY hdlv.NAM_TOT_NGHIEP DESC) R
              FROM QT_HUONG_DAN_LUAN_VAN hdlv
                       LEFT JOIN TCHC_CAN_BO cb on hdlv.SHCC = cb.SHCC
                       LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
                       LEFT JOIN DM_TRINH_DO td ON (cb.HOC_VI = td.MA)
                       LEFT JOIN DM_NGACH_CDNN cdnn ON (cdnn.MA = cb.NGACH)
              WHERE (((list_shcc IS NULL) AND (list_dv IS NULL) AND (fromYear IS NULL) AND (toYear IS NULL))
                  OR (((list_shcc IS NOT NULL AND cb.SHCC IN (SELECT regexp_substr(list_shcc, '[^,]+', 1, level)
                                                              from dual
                                                              connect by regexp_substr(list_shcc, '[^,]+', 1, level) is not null))
                      OR (list_dv IS NOT NULL AND cb.MA_DON_VI IN (SELECT regexp_substr(list_dv, '[^,]+', 1, level)
                                                                   from dual
                                                                   connect by regexp_substr(list_dv, '[^,]+', 1, level) is not null))
                      OR (list_shcc IS NULL AND list_dv IS NULL))
                      AND (hdlv.NAM_TOT_NGHIEP IS NOT NULL AND (fromYear IS NULL OR hdlv.NAM_TOT_NGHIEP >= fromYear))
                      AND (hdlv.NAM_TOT_NGHIEP IS NOT NULL AND (toYear IS NULL OR hdlv.NAM_TOT_NGHIEP <= toYear))))
                AND (searchTerm = ''
                  OR LOWER(cb.SHCC) LIKE sT
                  OR LOWER(TRIM(cb.HO || ' ' || cb.TEN)) LIKE sT
                  OR LOWER(hdlv.TEN_LUAN_VAN) LIKE sT
                  OR LOWER(hdlv.SAN_PHAM) LIKE sT)
              ORDER BY hdlv.NAM_TOT_NGHIEP DESC)
        WHERE R BETWEEN (pageNumber - 1) * pageSize + 1 AND pageNumber * pageSize;
    RETURN my_cursor;
END;

/
--EndMethod--

CREATE OR REPLACE FUNCTION QT_KEO_DAI_CONG_TAC_DOWNLOAD_EXCEL(filter IN STRING, searchTerm IN STRING) RETURN SYS_REFCURSOR
AS
    my_cursor SYS_REFCURSOR;
    ST        STRING(500) := '%' || lower(searchTerm) || '%';
    listShcc  STRING(100);
    listDv    STRING(100);
    fromYear  NUMBER;
    toYear    NUMBER;
    timeType  NUMBER;
BEGIN
    SELECT JSON_VALUE(filter, '$.listShcc') INTO listShcc FROM DUAL;
    SELECT JSON_VALUE(filter, '$.listDv') INTO listDv FROM DUAL;
    SELECT JSON_VALUE(filter, '$.fromYear') INTO fromYear FROM DUAL;
    SELECT JSON_VALUE(filter, '$.toYear') INTO toYear FROM DUAL;
    SELECT JSON_VALUE(filter, '$.timeType') INTO timeType FROM DUAL;

    OPEN my_cursor FOR
        SELECT *
        FROM (SELECT kdct.ID                   as                   "id",
                     kdct.SHCC                 as                   "shcc",
                     kdct.BAT_DAU              as                   "batDau",
                     kdct.BAT_DAU_TYPE         as                   "batDauType",
                     kdct.KET_THUC             as                   "ketThuc",
                     kdct.KET_THUC_TYPE        as                   "ketThucType",
                     kdct.SO_QUYET_DINH        AS                   "soQuyetDinh",
                     kdct.NGAY_QUYET_DINH      AS                   "ngayQuyetDinh",

                     cb.TEN                    as                   "tenCanBo",
                     cb.HO                     as                   "hoCanBo",
                     cb.PHAI                   AS                   "phai",
                     cb.NGAY_SINH              AS                   "ngaySinh",

                     dv.MA                     AS                   "maDonVi",
                     dv.TEN                    AS                   "tenDonVi",
                     (SELECT DMCV.TEN
                      FROM QT_CHUC_VU QTCV
                               LEFT JOIN DM_CHUC_VU DMCV ON DMCV.MA = QTCV.MA_CHUC_VU
                      WHERE QTCV.SHCC = CB.SHCC
                        AND CHUC_VU_CHINH = 1) AS                   "tenChucVu",

                     (SELECT QTCV.MA_CHUC_VU
                      FROM QT_CHUC_VU QTCV
                      WHERE QTCV.SHCC = CB.SHCC
                        AND CHUC_VU_CHINH = 1) AS                   "maChucVu",

                     td.MA                     AS                   "maHocVi",
                     td.TEN                    AS                   "tenHocVi",

                     CD.MA                     AS                   "maChucDanh",
                     CD.TEN                    AS                   "tenChucDanh",

                     cdnn.MA                   AS                   "maChucDanhNgheNghiep",
                     cdnn.TEN                  AS                   "tenChucDanhNgheNghiep",
                     ROW_NUMBER() OVER (ORDER BY kdct.BAT_DAU DESC) R
              FROM QT_KEO_DAI_CONG_TAC kdct
                       LEFT JOIN TCHC_CAN_BO cb on kdct.SHCC = cb.SHCC
                       LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
                       LEFT JOIN DM_TRINH_DO td ON (cb.HOC_VI = td.MA)
                       LEFT JOIN DM_NGACH_CDNN cdnn ON (cdnn.MA = cb.NGACH)
                       LEFT JOIN DM_CHUC_DANH_KHOA_HOC CD ON CB.CHUC_DANH = CD.MA

              WHERE (((listShcc IS NULL) AND (listDv IS NULL) AND (fromYear IS NULL) AND (toYear IS NULL) AND
                      (timeType IS NULL))
                  OR (((listShcc IS NOT NULL AND cb.SHCC IN (SELECT regexp_substr(listShcc, '[^,]+', 1, level)
                                                             from dual
                                                             connect by regexp_substr(listShcc, '[^,]+', 1, level) is not null))
                      OR (listDv IS NOT NULL AND cb.MA_DON_VI IN (SELECT regexp_substr(listDv, '[^,]+', 1, level)
                                                                  from dual
                                                                  connect by regexp_substr(listDv, '[^,]+', 1, level) is not null))
                      OR (listShcc IS NULL AND listDv IS NULL))
                      AND (timeType IS NULL OR (
                                  timeType = 0 AND
                                  (kdct.BAT_DAU IS NOT NULL AND (fromYear IS NULL OR kdct.BAT_DAU >= fromYear)) AND
                                  (toYear IS NULL OR kdct.BAT_DAU <= toYear)
                          ) OR (
                                       timeType = 1 AND (kdct.KET_THUC IS NOT NULL AND
                                                         (fromYear IS NULL OR kdct.KET_THUC >= fromYear)) AND
                                       (toYear IS NULL OR kdct.KET_THUC <= toYear)
                               ))))
                AND (searchTerm = ''
                  OR LOWER(cb.SHCC) LIKE ST
                  OR LOWER(TRIM(cb.HO || ' ' || cb.TEN)) LIKE ST
                  OR LOWER(kdct.SO_QUYET_DINH) LIKE ST)
              ORDER BY kdct.BAT_DAU DESC);
    RETURN my_cursor;

END;

/
--EndMethod--

CREATE OR REPLACE FUNCTION QT_KEO_DAI_CONG_TAC_GROUP_PAGE(pageNumber IN OUT NUMBER, pageSize IN OUT NUMBER, filter IN STRING,
                                               searchTerm IN STRING,
                                               totalItem OUT NUMBER, pageTotal OUT NUMBER) RETURN SYS_REFCURSOR
AS
    my_cursor SYS_REFCURSOR;
    ST        STRING(500) := '%' || lower(searchTerm) || '%';
    listShcc  STRING(100);
    listDv    STRING(100);
    fromYear  NUMBER;
    toYear    NUMBER;
    timeType  NUMBER;
BEGIN
    SELECT JSON_VALUE(filter, '$.listShcc') INTO listShcc FROM DUAL;
    SELECT JSON_VALUE(filter, '$.listDv') INTO listDv FROM DUAL;
    SELECT JSON_VALUE(filter, '$.fromYear') INTO fromYear FROM DUAL;
    SELECT JSON_VALUE(filter, '$.toYear') INTO toYear FROM DUAL;
    SELECT JSON_VALUE(filter, '$.timeType') INTO timeType FROM DUAL;

    SELECT COUNT(*)
    INTO totalItem
    FROM (SELECT *
          FROM QT_KEO_DAI_CONG_TAC
          WHERE ID IN (SELECT MAX(ID) FROM (SELECT * FROM QT_KEO_DAI_CONG_TAC ORDER BY SHCC DESC) GROUP BY SHCC)) kdct
             LEFT JOIN TCHC_CAN_BO cb on kdct.SHCC = cb.SHCC
             LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
             LEFT JOIN DM_TRINH_DO td ON (cb.HOC_VI = td.MA)
             LEFT JOIN DM_NGACH_CDNN cdnn ON (cdnn.MA = cb.NGACH);

    IF pageNumber < 1 THEN pageNumber := 1; END IF;
    IF pageSize < 1 THEN pageSize := 1; END IF;
    pageTotal := CEIL(totalItem / pageSize);
    pageNumber := LEAST(pageNumber, pageTotal);

    OPEN my_cursor FOR
        SELECT *
        FROM (SELECT kdct.ID                                          as "id",
                     kdct.SHCC                                        as "shcc",

                     (SELECT COUNT(*)
                      FROM QT_KEO_DAI_CONG_TAC kdct_temp
                               LEFT JOIN TCHC_CAN_BO cb on kdct_temp.SHCC = cb.SHCC
                               LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
                      WHERE (kdct_temp.SHCC = kdct.SHCC)
                        AND (((listShcc IS NULL) AND (listDv IS NULL) AND (fromYear IS NULL) AND (toYear IS NULL) AND
                              (timeType IS NULL))
                          OR (((listShcc IS NOT NULL AND cb.SHCC IN (SELECT regexp_substr(listShcc, '[^,]+', 1, level)
                                                                     from dual
                                                                     connect by regexp_substr(listShcc, '[^,]+', 1, level) is not null))
                              OR
                               (listDv IS NOT NULL AND cb.MA_DON_VI IN (SELECT regexp_substr(listDv, '[^,]+', 1, level)
                                                                        from dual
                                                                        connect by regexp_substr(listDv, '[^,]+', 1, level) is not null))
                              OR (listShcc IS NULL AND listDv IS NULL))
                              AND (timeType IS NULL OR (
                                          timeType = 0 AND (kdct_temp.BAT_DAU IS NOT NULL AND
                                                            (fromYear IS NULL OR kdct_temp.BAT_DAU >= fromYear)) AND
                                          (toYear IS NULL OR kdct_temp.BAT_DAU <= toYear)
                                  ) OR (
                                               timeType = 1 AND (kdct_temp.KET_THUC IS NOT NULL AND
                                                                 (fromYear IS NULL OR kdct_temp.KET_THUC >= fromYear)) AND
                                               (toYear IS NULL OR kdct_temp.KET_THUC <= toYear)
                                       ))))
                        AND (searchTerm = ''
                          OR LOWER(cb.SHCC) LIKE ST
                          OR LOWER(TRIM(cb.HO || ' ' || cb.TEN)) LIKE ST
                          OR LOWER(kdct_temp.SO_QUYET_DINH) LIKE ST)) AS "soQuaTrinh",

                     (select rtrim(xmlagg(xmlelement(e, kdct_temp.BAT_DAU || ' ', '??').extract('//text()') order by
                                          null).getclobval(), '??')
                      FROM QT_KEO_DAI_CONG_TAC kdct_temp
                               LEFT JOIN TCHC_CAN_BO cb on kdct_temp.SHCC = cb.SHCC
                               LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
                      WHERE (kdct_temp.SHCC = kdct.SHCC)
                        AND (((listShcc IS NULL) AND (listDv IS NULL) AND (fromYear IS NULL) AND (toYear IS NULL) AND
                              (timeType IS NULL))
                          OR (((listShcc IS NOT NULL AND cb.SHCC IN (SELECT regexp_substr(listShcc, '[^,]+', 1, level)
                                                                     from dual
                                                                     connect by regexp_substr(listShcc, '[^,]+', 1, level) is not null))
                              OR
                               (listDv IS NOT NULL AND cb.MA_DON_VI IN (SELECT regexp_substr(listDv, '[^,]+', 1, level)
                                                                        from dual
                                                                        connect by regexp_substr(listDv, '[^,]+', 1, level) is not null))
                              OR (listShcc IS NULL AND listDv IS NULL))
                              AND (timeType IS NULL OR (
                                          timeType = 0 AND (kdct_temp.BAT_DAU IS NOT NULL AND
                                                            (fromYear IS NULL OR kdct_temp.BAT_DAU >= fromYear)) AND
                                          (toYear IS NULL OR kdct_temp.BAT_DAU <= toYear)
                                  ) OR (
                                               timeType = 1 AND (kdct_temp.KET_THUC IS NOT NULL AND
                                                                 (fromYear IS NULL OR kdct_temp.KET_THUC >= fromYear)) AND
                                               (toYear IS NULL OR kdct_temp.KET_THUC <= toYear)
                                       ))))
                        AND (searchTerm = ''
                          OR LOWER(cb.SHCC) LIKE ST
                          OR LOWER(TRIM(cb.HO || ' ' || cb.TEN)) LIKE ST
                          OR LOWER(kdct_temp.SO_QUYET_DINH) LIKE ST)) AS "danhSachBatDau",

                     (select rtrim(xmlagg(xmlelement(e, kdct_temp.KET_THUC || ' ', '??').extract('//text()') order by
                                          null).getclobval(), '??')
                      FROM QT_KEO_DAI_CONG_TAC kdct_temp
                               LEFT JOIN TCHC_CAN_BO cb on kdct_temp.SHCC = cb.SHCC
                               LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
                      WHERE (kdct_temp.SHCC = kdct.SHCC)
                        AND (((listShcc IS NULL) AND (listDv IS NULL) AND (fromYear IS NULL) AND (toYear IS NULL) AND
                              (timeType IS NULL))
                          OR (((listShcc IS NOT NULL AND cb.SHCC IN (SELECT regexp_substr(listShcc, '[^,]+', 1, level)
                                                                     from dual
                                                                     connect by regexp_substr(listShcc, '[^,]+', 1, level) is not null))
                              OR
                               (listDv IS NOT NULL AND cb.MA_DON_VI IN (SELECT regexp_substr(listDv, '[^,]+', 1, level)
                                                                        from dual
                                                                        connect by regexp_substr(listDv, '[^,]+', 1, level) is not null))
                              OR (listShcc IS NULL AND listDv IS NULL))
                              AND (timeType IS NULL OR (
                                          timeType = 0 AND (kdct_temp.BAT_DAU IS NOT NULL AND
                                                            (fromYear IS NULL OR kdct_temp.BAT_DAU >= fromYear)) AND
                                          (toYear IS NULL OR kdct_temp.BAT_DAU <= toYear)
                                  ) OR (
                                               timeType = 1 AND (kdct_temp.KET_THUC IS NOT NULL AND
                                                                 (fromYear IS NULL OR kdct_temp.KET_THUC >= fromYear)) AND
                                               (toYear IS NULL OR kdct_temp.KET_THUC <= toYear)
                                       ))))
                        AND (searchTerm = ''
                          OR LOWER(cb.SHCC) LIKE ST
                          OR LOWER(TRIM(cb.HO || ' ' || cb.TEN)) LIKE ST
                          OR LOWER(kdct_temp.SO_QUYET_DINH) LIKE ST)) AS "danhSachKetThuc",

                     (select rtrim(xmlagg(xmlelement(e, kdct_temp.KET_THUC_TYPE || ' ', '??').extract('//text()') order
                                          by null).getclobval(), '??')
                      FROM QT_KEO_DAI_CONG_TAC kdct_temp
                               LEFT JOIN TCHC_CAN_BO cb on kdct_temp.SHCC = cb.SHCC
                               LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
                      WHERE (kdct_temp.SHCC = kdct.SHCC)
                        AND (((listShcc IS NULL) AND (listDv IS NULL) AND (fromYear IS NULL) AND (toYear IS NULL) AND
                              (timeType IS NULL))
                          OR (((listShcc IS NOT NULL AND cb.SHCC IN (SELECT regexp_substr(listShcc, '[^,]+', 1, level)
                                                                     from dual
                                                                     connect by regexp_substr(listShcc, '[^,]+', 1, level) is not null))
                              OR
                               (listDv IS NOT NULL AND cb.MA_DON_VI IN (SELECT regexp_substr(listDv, '[^,]+', 1, level)
                                                                        from dual
                                                                        connect by regexp_substr(listDv, '[^,]+', 1, level) is not null))
                              OR (listShcc IS NULL AND listDv IS NULL))
                              AND (timeType IS NULL OR (
                                          timeType = 0 AND (kdct_temp.BAT_DAU IS NOT NULL AND
                                                            (fromYear IS NULL OR kdct_temp.BAT_DAU >= fromYear)) AND
                                          (toYear IS NULL OR kdct_temp.BAT_DAU <= toYear)
                                  ) OR (
                                               timeType = 1 AND (kdct_temp.KET_THUC IS NOT NULL AND
                                                                 (fromYear IS NULL OR kdct_temp.KET_THUC >= fromYear)) AND
                                               (toYear IS NULL OR kdct_temp.KET_THUC <= toYear)
                                       ))))
                        AND (searchTerm = ''
                          OR LOWER(cb.SHCC) LIKE ST
                          OR LOWER(TRIM(cb.HO || ' ' || cb.TEN)) LIKE ST
                          OR LOWER(kdct_temp.SO_QUYET_DINH) LIKE ST)) AS "danhSachKetThucType",

                     (select rtrim(xmlagg(xmlelement(e, kdct_temp.BAT_DAU_TYPE || ' ', '??').extract('//text()') order
                                          by null).getclobval(), '??')
                      FROM QT_KEO_DAI_CONG_TAC kdct_temp
                               LEFT JOIN TCHC_CAN_BO cb on kdct_temp.SHCC = cb.SHCC
                               LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
                      WHERE (kdct_temp.SHCC = kdct.SHCC)
                        AND (((listShcc IS NULL) AND (listDv IS NULL) AND (fromYear IS NULL) AND (toYear IS NULL) AND
                              (timeType IS NULL))
                          OR (((listShcc IS NOT NULL AND cb.SHCC IN (SELECT regexp_substr(listShcc, '[^,]+', 1, level)
                                                                     from dual
                                                                     connect by regexp_substr(listShcc, '[^,]+', 1, level) is not null))
                              OR
                               (listDv IS NOT NULL AND cb.MA_DON_VI IN (SELECT regexp_substr(listDv, '[^,]+', 1, level)
                                                                        from dual
                                                                        connect by regexp_substr(listDv, '[^,]+', 1, level) is not null))
                              OR (listShcc IS NULL AND listDv IS NULL))
                              AND (timeType IS NULL OR (
                                          timeType = 0 AND (kdct_temp.BAT_DAU IS NOT NULL AND
                                                            (fromYear IS NULL OR kdct_temp.BAT_DAU >= fromYear)) AND
                                          (toYear IS NULL OR kdct_temp.BAT_DAU <= toYear)
                                  ) OR (
                                               timeType = 1 AND (kdct_temp.KET_THUC IS NOT NULL AND
                                                                 (fromYear IS NULL OR kdct_temp.KET_THUC >= fromYear)) AND
                                               (toYear IS NULL OR kdct_temp.KET_THUC <= toYear)
                                       ))))
                        AND (searchTerm = ''
                          OR LOWER(cb.SHCC) LIKE ST
                          OR LOWER(TRIM(cb.HO || ' ' || cb.TEN)) LIKE ST
                          OR LOWER(kdct_temp.SO_QUYET_DINH) LIKE ST)) AS "danhSachBatDauType",

                     cb.TEN                                           as "tenCanBo",
                     cb.HO                                            as "hoCanBo",
                     cb.PHAI                                          AS "phai",
                     cb.NGAY_SINH                                     AS "ngaySinh",

                     dv.MA                                            AS "maDonVi",
                     dv.TEN                                           AS "tenDonVi",
                     (SELECT DMCV.TEN
                      FROM QT_CHUC_VU QTCV
                               LEFT JOIN DM_CHUC_VU DMCV ON DMCV.MA = QTCV.MA_CHUC_VU
                      WHERE QTCV.SHCC = CB.SHCC
                        AND CHUC_VU_CHINH = 1)                        AS "tenChucVu",

                     (SELECT QTCV.MA_CHUC_VU
                      FROM QT_CHUC_VU QTCV
                      WHERE QTCV.SHCC = CB.SHCC
                        AND CHUC_VU_CHINH = 1)                        AS "maChucVu",
                     td.MA                                            AS "maHocVi",
                     td.TEN                                           AS "tenHocVi",

                     CD.MA                                            AS "maChucDanh",
                     CD.TEN                                           AS "tenChucDanh",

                     cdnn.MA                                          AS "maChucDanhNgheNghiep",
                     cdnn.TEN                                         AS "tenChucDanhNgheNghiep",

                     ROW_NUMBER() OVER (ORDER BY kdct.BAT_DAU DESC )     R
              FROM (SELECT *
                    FROM QT_KEO_DAI_CONG_TAC
                    WHERE ID IN (SELECT MAX(ID)
                                 FROM (SELECT * FROM QT_KEO_DAI_CONG_TAC ORDER BY SHCC DESC)
                                 GROUP BY SHCC)) kdct
                       LEFT JOIN TCHC_CAN_BO cb on kdct.SHCC = cb.SHCC
                       LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
                       LEFT JOIN DM_TRINH_DO td ON (cb.HOC_VI = td.MA)
                       LEFT JOIN DM_NGACH_CDNN cdnn ON (cdnn.MA = cb.NGACH)
                       LEFT JOIN DM_CHUC_DANH_KHOA_HOC CD ON CB.CHUC_DANH = CD.MA

              ORDER BY kdct.BAT_DAU DESC)
        WHERE R BETWEEN (pageNumber - 1) * pageSize + 1 AND pageNumber * pageSize;
    RETURN my_cursor;

END;

/
--EndMethod--

CREATE OR REPLACE FUNCTION QT_KEO_DAI_CONG_TAC_SEARCH_PAGE(pageNumber IN OUT NUMBER, pageSize IN OUT NUMBER, filter IN STRING,
                                                searchTerm IN STRING,
                                                totalItem OUT NUMBER, pageTotal OUT NUMBER) RETURN SYS_REFCURSOR
AS
    my_cursor SYS_REFCURSOR;
    ST        STRING(500) := '%' || lower(searchTerm) || '%';
    listShcc  STRING(100);
    listDv    STRING(100);
    fromYear  NUMBER;
    toYear    NUMBER;
    timeType  NUMBER;
BEGIN
    SELECT JSON_VALUE(filter, '$.listShcc') INTO listShcc FROM DUAL;
    SELECT JSON_VALUE(filter, '$.listDv') INTO listDv FROM DUAL;
    SELECT JSON_VALUE(filter, '$.fromYear') INTO fromYear FROM DUAL;
    SELECT JSON_VALUE(filter, '$.toYear') INTO toYear FROM DUAL;
    SELECT JSON_VALUE(filter, '$.timeType') INTO timeType FROM DUAL;

    SELECT COUNT(*)
    INTO totalItem

    FROM QT_KEO_DAI_CONG_TAC kdct
             LEFT JOIN TCHC_CAN_BO cb on kdct.SHCC = cb.SHCC
             LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
             LEFT JOIN DM_TRINH_DO td ON (cb.HOC_VI = td.MA)
             LEFT JOIN DM_NGACH_CDNN cdnn ON (cdnn.MA = cb.NGACH)
             LEFT JOIN DM_CHUC_DANH_KHOA_HOC CD ON CB.CHUC_DANH = CD.MA

    WHERE (((listShcc IS NULL) AND (listDv IS NULL) AND (fromYear IS NULL) AND (toYear IS NULL) AND (timeType IS NULL))
        OR (((listShcc IS NOT NULL AND cb.SHCC IN (SELECT regexp_substr(listShcc, '[^,]+', 1, level)
                                                   from dual
                                                   connect by regexp_substr(listShcc, '[^,]+', 1, level) is not null))
            OR (listDv IS NOT NULL AND cb.MA_DON_VI IN (SELECT regexp_substr(listDv, '[^,]+', 1, level)
                                                        from dual
                                                        connect by regexp_substr(listDv, '[^,]+', 1, level) is not null))
            OR (listShcc IS NULL AND listDv IS NULL))
            AND (timeType IS NULL OR (
                        timeType = 0 AND
                        (kdct.BAT_DAU IS NOT NULL AND (fromYear IS NULL OR kdct.BAT_DAU >= fromYear)) AND
                        (toYear IS NULL OR kdct.BAT_DAU <= toYear)
                ) OR (
                             timeType = 1 AND
                             (kdct.KET_THUC IS NOT NULL AND (fromYear IS NULL OR kdct.KET_THUC >= fromYear)) AND
                             (toYear IS NULL OR kdct.KET_THUC <= toYear)
                     ))))
      AND (searchTerm = ''
        OR LOWER(cb.SHCC) LIKE ST
        OR LOWER(TRIM(cb.HO || ' ' || cb.TEN)) LIKE ST
        OR LOWER(kdct.SO_QUYET_DINH) LIKE ST);

    IF pageNumber < 1 THEN pageNumber := 1; END IF;
    IF pageSize < 1 THEN pageSize := 1; END IF;
    pageTotal := CEIL(totalItem / pageSize);
    pageNumber := LEAST(pageNumber, pageTotal);

    OPEN my_cursor FOR
        SELECT *
        FROM (SELECT kdct.ID                   as                   "id",
                     kdct.SHCC                 as                   "shcc",
                     kdct.BAT_DAU              as                   "batDau",
                     kdct.BAT_DAU_TYPE         as                   "batDauType",
                     kdct.KET_THUC             as                   "ketThuc",
                     kdct.KET_THUC_TYPE        as                   "ketThucType",
                     kdct.SO_QUYET_DINH        AS                   "soQuyetDinh",
                     kdct.NGAY_QUYET_DINH      AS                   "ngayQuyetDinh",

                     cb.TEN                    as                   "tenCanBo",
                     cb.HO                     as                   "hoCanBo",
                     cb.PHAI                   AS                   "phai",
                     cb.NGAY_SINH              AS                   "ngaySinh",

                     dv.MA                     AS                   "maDonVi",
                     dv.TEN                    AS                   "tenDonVi",
                     (SELECT DMCV.TEN
                      FROM QT_CHUC_VU QTCV
                               LEFT JOIN DM_CHUC_VU DMCV ON DMCV.MA = QTCV.MA_CHUC_VU
                      WHERE QTCV.SHCC = CB.SHCC
                        AND CHUC_VU_CHINH = 1) AS                   "tenChucVu",

                     (SELECT QTCV.MA_CHUC_VU
                      FROM QT_CHUC_VU QTCV
                      WHERE QTCV.SHCC = CB.SHCC
                        AND CHUC_VU_CHINH = 1) AS                   "maChucVu",
                     td.MA                     AS                   "maHocVi",
                     td.TEN                    AS                   "tenHocVi",

                     CD.MA                     AS                   "maChucDanh",
                     CD.TEN                    AS                   "tenChucDanh",

                     cdnn.MA                   AS                   "maChucDanhNgheNghiep",
                     cdnn.TEN                  AS                   "tenChucDanhNgheNghiep",
                     ROW_NUMBER() OVER (ORDER BY kdct.BAT_DAU DESC) R
              FROM QT_KEO_DAI_CONG_TAC kdct
                       LEFT JOIN TCHC_CAN_BO cb on kdct.SHCC = cb.SHCC
                       LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
                       LEFT JOIN DM_TRINH_DO td ON (cb.HOC_VI = td.MA)
                       LEFT JOIN DM_NGACH_CDNN cdnn ON (cdnn.MA = cb.NGACH)
                       LEFT JOIN DM_CHUC_DANH_KHOA_HOC CD ON CB.CHUC_DANH = CD.MA

              WHERE (((listShcc IS NULL) AND (listDv IS NULL) AND (fromYear IS NULL) AND (toYear IS NULL) AND
                      (timeType IS NULL))
                  OR (((listShcc IS NOT NULL AND cb.SHCC IN (SELECT regexp_substr(listShcc, '[^,]+', 1, level)
                                                             from dual
                                                             connect by regexp_substr(listShcc, '[^,]+', 1, level) is not null))
                      OR (listDv IS NOT NULL AND cb.MA_DON_VI IN (SELECT regexp_substr(listDv, '[^,]+', 1, level)
                                                                  from dual
                                                                  connect by regexp_substr(listDv, '[^,]+', 1, level) is not null))
                      OR (listShcc IS NULL AND listDv IS NULL))
                      AND (timeType IS NULL OR (
                                  timeType = 0 AND
                                  (kdct.BAT_DAU IS NOT NULL AND (fromYear IS NULL OR kdct.BAT_DAU >= fromYear)) AND
                                  (toYear IS NULL OR kdct.BAT_DAU <= toYear)
                          ) OR (
                                       timeType = 1 AND (kdct.KET_THUC IS NOT NULL AND
                                                         (fromYear IS NULL OR kdct.KET_THUC >= fromYear)) AND
                                       (toYear IS NULL OR kdct.KET_THUC <= toYear)
                               ))))
                AND (searchTerm = ''
                  OR LOWER(cb.SHCC) LIKE ST
                  OR LOWER(TRIM(cb.HO || ' ' || cb.TEN)) LIKE ST
                  OR LOWER(kdct.SO_QUYET_DINH) LIKE ST)
              ORDER BY kdct.BAT_DAU DESC)
        WHERE R BETWEEN (pageNumber - 1) * pageSize + 1 AND pageNumber * pageSize;
    RETURN my_cursor;

END;

/
--EndMethod--

CREATE OR REPLACE FUNCTION QT_KHEN_THUONG_ALL_DOWNLOAD_EXCEL(filter IN STRING) RETURN SYS_REFCURSOR
AS
    my_cursor SYS_REFCURSOR;
    loaiDoiTuong STRING(3);
    list_shcc STRING(100);
    list_dv STRING(100);
    fromYear NUMBER;
    toYear NUMBER;
    listThanhTich STRING(100);
BEGIN
    /* Init filter */-------------------------------------------------------------------------------------
    SELECT JSON_VALUE(filter, '$.loaiDoiTuong') INTO loaiDoiTuong FROM DUAL;
    SELECT JSON_VALUE(filter, '$.listDv') INTO list_dv FROM DUAL;
    SELECT JSON_VALUE(filter, '$.listShcc') INTO list_shcc FROM DUAL;
    SELECT JSON_VALUE(filter, '$.fromYear') INTO fromYear FROM DUAL;
    SELECT JSON_VALUE(filter, '$.toYear') INTO toYear FROM DUAL;
    SELECT JSON_VALUE(filter, '$.listThanhTich') INTO listThanhTich FROM DUAL;

    OPEN my_cursor FOR
        SELECT *
        FROM (
                 SELECT qtkta.MA           AS                "ma",
                        qtkta.ID           AS                "id",
                        qtkta.nam_dat_duoc AS                "namDatDuoc",
                        qtkta.DIEM_THI_DUA AS                "diemThiDua",
                        qtkta.SO_QUYET_DINH AS "soQuyetDinh",
                        ldt.MA             AS                "maLoaiDoiTuong",
                        ldt.TEN            AS                "tenLoaiDoiTuong",

                        cb.SHCC            AS                "maCanBo",
                        cb.HO              AS                "hoCanBo",
                        cb.TEN             AS                "tenCanBo",
                        dv3.MA  AS "maDonViCanBo",
                        dv3.TEN AS "tenDonViCanBo",

                        dv.MA              AS                "maDonVi",
                        dv.TEN             AS                "tenDonVi",

                        bm.MA              AS                "maBoMon",
                        bm.TEN             AS                "tenBoMon",
                        bm.MA_DV           AS                "maDonViBoMon",
                        dv2.TEN            AS                "tenDonViBoMon",

                        ktkh.MA            AS                "maThanhTich",
                        ktkh.TEN           AS                "tenThanhTich",

                        ktct.MA            AS                "maChuThich",
                        ktct.TEN           AS                "tenChuThich",
                        ROW_NUMBER() OVER (ORDER BY qtkta.NAM_DAT_DUOC DESC, qtkta.ID DESC) R
                 FROM QT_KHEN_THUONG_ALL qtkta
                          LEFT JOIN DM_KHEN_THUONG_LOAI_DOI_TUONG ldt on ldt.MA = qtkta.LOAI_DOI_TUONG
                          LEFT JOIN TCHC_CAN_BO cb on (qtkta.LOAI_DOI_TUONG = '02' and qtkta.MA = cb.SHCC)
                          LEFT JOIN DM_DON_VI dv on (qtkta.LOAI_DOI_TUONG = '03' and qtkta.MA = TO_CHAR(dv.MA))
                          LEFT JOIN DM_BO_MON bm on (qtkta.LOAI_DOI_TUONG = '04' and qtkta.MA = TO_CHAR(bm.MA))
                          LEFT JOIN DM_DON_VI dv2 on (bm.MA_DV = dv2.ma)
                          LEFT JOIN DM_DON_VI dv3 on (cb.MA_DON_VI = dv3.ma)
                          LEFT JOIN DM_KHEN_THUONG_KY_HIEU ktkh ON qtkta.THANH_TICH = ktkh.MA
                          LEFT JOIN DM_KHEN_THUONG_CHU_THICH ktct ON qtkta.CHU_THICH = ktct.MA
                WHERE (loaiDoiTuong = '-1' OR (loaiDoiTuong = qtkta.LOAI_DOI_TUONG))
                    AND ((list_shcc IS NULL AND list_dv IS NULL)
                        OR ((qtkta.LOAI_DOI_TUONG = '02') AND
                            ((list_shcc IS NOT NULL AND qtkta.MA IN (SELECT regexp_substr(list_shcc, '[^,]+', 1, level) from dual connect by regexp_substr(list_shcc, '[^,]+', 1, level) is not null))
                            OR (list_dv IS NOT NULL AND cb.MA_DON_VI IN (SELECT regexp_substr(list_dv, '[^,]+', 1, level) from dual connect by regexp_substr(list_dv, '[^,]+', 1, level) is not null))
                            )))
                    AND ((
                            (fromYear IS NULL) AND (toYear IS NULL)
                        ) OR (
                              (qtkta.NAM_DAT_DUOC IS NOT NULL AND (fromYear IS NULL OR
                               (TO_NUMBER(qtkta.NAM_DAT_DUOC) >= fromYear)))
                              AND (qtkta.NAM_DAT_DUOC IS NOT NULL AND (toYear IS NULL OR
                                   (TO_NUMBER(qtkta.NAM_DAT_DUOC) <= toYear)))
                        ))
                    AND (qtkta.THANH_TICH IS NOT NULL AND (listThanhTich IS NULL OR qtkta.THANH_TICH IN (SELECT regexp_substr(listThanhTich, '[^,]+', 1, level) from dual connect by regexp_substr(listThanhTich, '[^,]+', 1, level) is not null)))
                ORDER BY qtkta.NAM_DAT_DUOC DESC, qtkta.ID DESC
             );
    RETURN my_cursor;

END;

/
--EndMethod--

CREATE OR REPLACE FUNCTION QT_KHEN_THUONG_ALL_GROUP_PAGE(pageNumber IN OUT NUMBER, pageSize IN OUT NUMBER, filter IN STRING,
                                            searchTerm IN STRING, totalItem OUT NUMBER, pageTotal OUT NUMBER) RETURN SYS_REFCURSOR
AS
    my_cursor SYS_REFCURSOR;
    sT        STRING(500) := '%' || lower(searchTerm) || '%';
    loaiDoiTuong STRING(3);
    list_shcc STRING(100);
    list_dv STRING(100);
    fromYear NUMBER;
    toYear NUMBER;
    listThanhTich STRING(100);
BEGIN
    /* Init filter */-------------------------------------------------------------------------------------
    SELECT JSON_VALUE(filter, '$.loaiDoiTuong') INTO loaiDoiTuong FROM DUAL;
    SELECT JSON_VALUE(filter, '$.listDv') INTO list_dv FROM DUAL;
    SELECT JSON_VALUE(filter, '$.listShcc') INTO list_shcc FROM DUAL;
    SELECT JSON_VALUE(filter, '$.fromYear') INTO fromYear FROM DUAL;
    SELECT JSON_VALUE(filter, '$.toYear') INTO toYear FROM DUAL;
    SELECT JSON_VALUE(filter, '$.listThanhTich') INTO listThanhTich FROM DUAL;

    SELECT COUNT(*)
    INTO totalItem
    FROM (SELECT *
            FROM QT_KHEN_THUONG_ALL
            WHERE ID IN (
                SELECT MAX(ID) FROM (SELECT * FROM QT_KHEN_THUONG_ALL ORDER BY MA DESC ) GROUP BY MA, LOAI_DOI_TUONG)) qtkta
            LEFT JOIN DM_KHEN_THUONG_LOAI_DOI_TUONG ldt on ldt.MA = qtkta.LOAI_DOI_TUONG
            LEFT JOIN TCHC_CAN_BO cb on (qtkta.LOAI_DOI_TUONG = '02' and qtkta.MA = cb.SHCC)
            LEFT JOIN DM_DON_VI dv on (qtkta.LOAI_DOI_TUONG = '03' and qtkta.MA = TO_CHAR(dv.MA))
            LEFT JOIN DM_BO_MON bm on (qtkta.LOAI_DOI_TUONG = '04' and qtkta.MA = TO_CHAR(bm.MA))
            LEFT JOIN DM_DON_VI dv3 on (cb.MA_DON_VI = dv3.ma)
            LEFT JOIN DM_DON_VI dv2 on (bm.MA_DV = dv2.ma)
    WHERE (loaiDoiTuong = '-1' OR (loaiDoiTuong = qtkta.LOAI_DOI_TUONG));
    pageTotal := CEIL(totalItem / pageSize);
    pageNumber := LEAST(pageNumber, pageTotal);
    IF pageNumber < 1 THEN pageNumber := 1; END IF;
    IF pageSize < 1 THEN pageSize := 1; END IF;

    OPEN my_cursor FOR
        SELECT *
        FROM (
                 SELECT qtkta.MA    AS  "ma",
                        qtkta.ID    AS  "id",

                        (SELECT COUNT(*)
                        FROM QT_KHEN_THUONG_ALL qtkta_temp
                                 LEFT JOIN DM_KHEN_THUONG_LOAI_DOI_TUONG ldt on ldt.MA = qtkta_temp.LOAI_DOI_TUONG
                                 LEFT JOIN TCHC_CAN_BO cb on (qtkta_temp.LOAI_DOI_TUONG = '02' and qtkta_temp.MA = cb.SHCC)
                                 LEFT JOIN DM_DON_VI dv on (qtkta_temp.LOAI_DOI_TUONG = '03' and qtkta_temp.MA = TO_CHAR(dv.MA))
                                 LEFT JOIN DM_BO_MON bm on (qtkta_temp.LOAI_DOI_TUONG = '04' and qtkta_temp.MA = TO_CHAR(bm.MA))
                                 LEFT JOIN DM_KHEN_THUONG_KY_HIEU ktkh ON qtkta_temp.THANH_TICH = ktkh.MA
                                 LEFT JOIN DM_KHEN_THUONG_CHU_THICH ktct ON qtkta_temp.CHU_THICH = ktct.MA
                        WHERE (qtkta_temp.LOAI_DOI_TUONG = qtkta.LOAI_DOI_TUONG AND qtkta_temp.MA = qtkta.MA)
                            AND (loaiDoiTuong = '-1' OR (loaiDoiTuong = qtkta_temp.LOAI_DOI_TUONG))
                                AND ((list_shcc IS NULL AND list_dv IS NULL)
                                    OR ((qtkta_temp.LOAI_DOI_TUONG = '02') AND
                                        ((list_shcc IS NOT NULL AND qtkta_temp.MA IN (SELECT regexp_substr(list_shcc, '[^,]+', 1, level) from dual connect by regexp_substr(list_shcc, '[^,]+', 1, level) is not null))
                                        OR (list_dv IS NOT NULL AND cb.MA_DON_VI IN (SELECT regexp_substr(list_dv, '[^,]+', 1, level) from dual connect by regexp_substr(list_dv, '[^,]+', 1, level) is not null))
                                        )))
                                AND ((
                                        (fromYear IS NULL) AND (toYear IS NULL)
                                    ) OR (
                                          (qtkta_temp.NAM_DAT_DUOC IS NOT NULL AND (fromYear IS NULL OR
                                           (TO_NUMBER(qtkta_temp.NAM_DAT_DUOC) >= fromYear)))
                                          AND (qtkta_temp.NAM_DAT_DUOC IS NOT NULL AND (toYear IS NULL OR
                                               (TO_NUMBER(qtkta_temp.NAM_DAT_DUOC) <= toYear)))
                                    ))
                                AND (qtkta_temp.THANH_TICH IS NOT NULL AND (listThanhTich IS NULL OR qtkta_temp.THANH_TICH IN (SELECT regexp_substr(listThanhTich, '[^,]+', 1, level) from dual connect by regexp_substr(listThanhTich, '[^,]+', 1, level) is not null)))
                                AND (searchTerm = ''
                               OR LOWER(cb.SHCC) LIKE sT
                               OR LOWER(TRIM(cb.HO || ' ' || cb.TEN)) LIKE sT
                               OR LOWER(TRIM(dv.TEN)) LIKE sT
                               OR LOWER(TRIM(bm.TEN)) LIKE sT
                               OR LOWER(ldt.TEN) like sT
                               OR LOWER(TRIM(ktct.TEN)) LIKE sT
                               OR LOWER(TRIM(ktkh.ten)) LIKE sT)
                        ) AS "soKhenThuong",

                        (select rtrim(xmlagg(xmlelement(e, ktkh.TEN || ' ','??').extract('//text()') order by null).getclobval(),'??')
                        FROM QT_KHEN_THUONG_ALL qtkta_temp
                                 LEFT JOIN DM_KHEN_THUONG_LOAI_DOI_TUONG ldt on ldt.MA = qtkta_temp.LOAI_DOI_TUONG
                                 LEFT JOIN TCHC_CAN_BO cb on (qtkta_temp.LOAI_DOI_TUONG = '02' and qtkta_temp.MA = cb.SHCC)
                                 LEFT JOIN DM_DON_VI dv on (qtkta_temp.LOAI_DOI_TUONG = '03' and qtkta_temp.MA = TO_CHAR(dv.MA))
                                 LEFT JOIN DM_BO_MON bm on (qtkta_temp.LOAI_DOI_TUONG = '04' and qtkta_temp.MA = TO_CHAR(bm.MA))
                                 LEFT JOIN DM_KHEN_THUONG_KY_HIEU ktkh ON qtkta_temp.THANH_TICH = ktkh.MA
                                 LEFT JOIN DM_KHEN_THUONG_CHU_THICH ktct ON qtkta_temp.CHU_THICH = ktct.MA
                        WHERE (qtkta_temp.LOAI_DOI_TUONG = qtkta.LOAI_DOI_TUONG AND qtkta_temp.MA = qtkta.MA)
                            AND (loaiDoiTuong = '-1' OR (loaiDoiTuong = qtkta_temp.LOAI_DOI_TUONG))
                                AND ((list_shcc IS NULL AND list_dv IS NULL)
                                    OR ((qtkta_temp.LOAI_DOI_TUONG = '02') AND
                                        ((list_shcc IS NOT NULL AND qtkta_temp.MA IN (SELECT regexp_substr(list_shcc, '[^,]+', 1, level) from dual connect by regexp_substr(list_shcc, '[^,]+', 1, level) is not null))
                                        OR (list_dv IS NOT NULL AND cb.MA_DON_VI IN (SELECT regexp_substr(list_dv, '[^,]+', 1, level) from dual connect by regexp_substr(list_dv, '[^,]+', 1, level) is not null))
                                        )))
                                AND ((
                                        (fromYear IS NULL) AND (toYear IS NULL)
                                    ) OR (
                                          (qtkta_temp.NAM_DAT_DUOC IS NOT NULL AND (fromYear IS NULL OR
                                           (TO_NUMBER(qtkta_temp.NAM_DAT_DUOC) >= fromYear)))
                                          AND (qtkta_temp.NAM_DAT_DUOC IS NOT NULL AND (toYear IS NULL OR
                                               (TO_NUMBER(qtkta_temp.NAM_DAT_DUOC) <= toYear)))
                                    ))
                                AND (qtkta_temp.THANH_TICH IS NOT NULL AND (listThanhTich IS NULL OR qtkta_temp.THANH_TICH IN (SELECT regexp_substr(listThanhTich, '[^,]+', 1, level) from dual connect by regexp_substr(listThanhTich, '[^,]+', 1, level) is not null)))
                                AND (searchTerm = ''
                               OR LOWER(cb.SHCC) LIKE sT
                               OR LOWER(TRIM(cb.HO || ' ' || cb.TEN)) LIKE sT
                               OR LOWER(TRIM(dv.TEN)) LIKE sT
                               OR LOWER(TRIM(bm.TEN)) LIKE sT
                               OR LOWER(ldt.TEN) like sT
                               OR LOWER(TRIM(ktct.TEN)) LIKE sT
                               OR LOWER(TRIM(ktkh.ten)) LIKE sT)
                        ) AS "danhSachKhenThuong",

                        (select rtrim(xmlagg(xmlelement(e, qtkta_temp.NAM_DAT_DUOC || ' ','??').extract('//text()') order by null).getclobval(),'??')
                        FROM QT_KHEN_THUONG_ALL qtkta_temp
                                 LEFT JOIN DM_KHEN_THUONG_LOAI_DOI_TUONG ldt on ldt.MA = qtkta_temp.LOAI_DOI_TUONG
                                 LEFT JOIN TCHC_CAN_BO cb on (qtkta_temp.LOAI_DOI_TUONG = '02' and qtkta_temp.MA = cb.SHCC)
                                 LEFT JOIN DM_DON_VI dv on (qtkta_temp.LOAI_DOI_TUONG = '03' and qtkta_temp.MA = TO_CHAR(dv.MA))
                                 LEFT JOIN DM_BO_MON bm on (qtkta_temp.LOAI_DOI_TUONG = '04' and qtkta_temp.MA = TO_CHAR(bm.MA))
                                 LEFT JOIN DM_KHEN_THUONG_KY_HIEU ktkh ON qtkta_temp.THANH_TICH = ktkh.MA
                                 LEFT JOIN DM_KHEN_THUONG_CHU_THICH ktct ON qtkta_temp.CHU_THICH = ktct.MA
                        WHERE (qtkta_temp.LOAI_DOI_TUONG = qtkta.LOAI_DOI_TUONG AND qtkta_temp.MA = qtkta.MA)
                            AND (loaiDoiTuong = '-1' OR (loaiDoiTuong = qtkta_temp.LOAI_DOI_TUONG))
                                AND ((list_shcc IS NULL AND list_dv IS NULL)
                                    OR ((qtkta_temp.LOAI_DOI_TUONG = '02') AND
                                        ((list_shcc IS NOT NULL AND qtkta_temp.MA IN (SELECT regexp_substr(list_shcc, '[^,]+', 1, level) from dual connect by regexp_substr(list_shcc, '[^,]+', 1, level) is not null))
                                        OR (list_dv IS NOT NULL AND cb.MA_DON_VI IN (SELECT regexp_substr(list_dv, '[^,]+', 1, level) from dual connect by regexp_substr(list_dv, '[^,]+', 1, level) is not null))
                                        )))
                                AND ((
                                        (fromYear IS NULL) AND (toYear IS NULL)
                                    ) OR (
                                          (qtkta_temp.NAM_DAT_DUOC IS NOT NULL AND (fromYear IS NULL OR
                                           (TO_NUMBER(qtkta_temp.NAM_DAT_DUOC) >= fromYear)))
                                          AND (qtkta_temp.NAM_DAT_DUOC IS NOT NULL AND (toYear IS NULL OR
                                               (TO_NUMBER(qtkta_temp.NAM_DAT_DUOC) <= toYear)))
                                    ))
                                AND (qtkta_temp.THANH_TICH IS NOT NULL AND (listThanhTich IS NULL OR qtkta_temp.THANH_TICH IN (SELECT regexp_substr(listThanhTich, '[^,]+', 1, level) from dual connect by regexp_substr(listThanhTich, '[^,]+', 1, level) is not null)))
                                AND (searchTerm = ''
                               OR LOWER(cb.SHCC) LIKE sT
                               OR LOWER(TRIM(cb.HO || ' ' || cb.TEN)) LIKE sT
                               OR LOWER(TRIM(dv.TEN)) LIKE sT
                               OR LOWER(TRIM(bm.TEN)) LIKE sT
                               OR LOWER(ldt.TEN) like sT
                               OR LOWER(TRIM(ktct.TEN)) LIKE sT
                               OR LOWER(TRIM(ktkh.ten)) LIKE sT)
                        ) AS "danhSachNamDatDuoc",

                        ldt.MA  AS "maLoaiDoiTuong",
                        ldt.TEN AS "tenLoaiDoiTuong",

                        cb.SHCC AS "maCanBo",
                        cb.HO   AS  "hoCanBo",
                        cb.TEN  AS  "tenCanBo",
                        dv3.MA  AS "maDonViCanBo",
                        dv3.TEN AS "tenDonViCanBo",

                        dv.MA              AS                "maDonVi",
                        dv.TEN             AS                "tenDonVi",

                        bm.MA              AS                "maBoMon",
                        bm.TEN             AS                "tenBoMon",
                        bm.MA_DV           AS                "maDonViBoMon",
                        dv2.TEN            AS                "tenDonViBoMon",
                        ROW_NUMBER() OVER (ORDER BY qtkta.NAM_DAT_DUOC DESC, qtkta.ID DESC) R
                FROM (SELECT *
                        FROM QT_KHEN_THUONG_ALL
                        WHERE ID IN (
                            SELECT MAX(ID) FROM (SELECT * FROM QT_KHEN_THUONG_ALL ORDER BY MA DESC ) GROUP BY MA, LOAI_DOI_TUONG)) qtkta
                        LEFT JOIN DM_KHEN_THUONG_LOAI_DOI_TUONG ldt on ldt.MA = qtkta.LOAI_DOI_TUONG
                        LEFT JOIN TCHC_CAN_BO cb on (qtkta.LOAI_DOI_TUONG = '02' and qtkta.MA = cb.SHCC)
                        LEFT JOIN DM_DON_VI dv on (qtkta.LOAI_DOI_TUONG = '03' and qtkta.MA = TO_CHAR(dv.MA))
                        LEFT JOIN DM_BO_MON bm on (qtkta.LOAI_DOI_TUONG = '04' and qtkta.MA = TO_CHAR(bm.MA))
                        LEFT JOIN DM_DON_VI dv2 on (bm.MA_DV = dv2.ma)
                        LEFT JOIN DM_DON_VI dv3 on (cb.MA_DON_VI = dv3.ma)
                WHERE (loaiDoiTuong = '-1' OR (loaiDoiTuong = qtkta.LOAI_DOI_TUONG))
                ORDER BY qtkta.NAM_DAT_DUOC DESC, qtkta.ID DESC
            )
        WHERE R BETWEEN (pageNumber - 1) * pageSize + 1 AND  pageNumber * pageSize;
    RETURN my_cursor;
END;

/
--EndMethod--

CREATE OR REPLACE FUNCTION QT_KHEN_THUONG_ALL_SEARCH_PAGE(pageNumber IN OUT NUMBER, pageSize IN OUT NUMBER, filter IN STRING,
                                            searchTerm IN STRING, totalItem OUT NUMBER, pageTotal OUT NUMBER) RETURN SYS_REFCURSOR
AS
    my_cursor SYS_REFCURSOR;
    sT        STRING(500) := '%' || lower(searchTerm) || '%';
    loaiDoiTuong STRING(3);
    list_shcc STRING(100);
    list_dv STRING(100);
    fromYear NUMBER;
    toYear NUMBER;
    listThanhTich STRING(100);
BEGIN
    /* Init filter */-------------------------------------------------------------------------------------
    SELECT JSON_VALUE(filter, '$.loaiDoiTuong') INTO loaiDoiTuong FROM DUAL;
    SELECT JSON_VALUE(filter, '$.listDv') INTO list_dv FROM DUAL;
    SELECT JSON_VALUE(filter, '$.listShcc') INTO list_shcc FROM DUAL;
    SELECT JSON_VALUE(filter, '$.fromYear') INTO fromYear FROM DUAL;
    SELECT JSON_VALUE(filter, '$.toYear') INTO toYear FROM DUAL;
    SELECT JSON_VALUE(filter, '$.listThanhTich') INTO listThanhTich FROM DUAL;

    SELECT COUNT(*)
    INTO totalItem

    FROM QT_KHEN_THUONG_ALL qtkta
             LEFT JOIN DM_KHEN_THUONG_LOAI_DOI_TUONG ldt on ldt.MA = qtkta.LOAI_DOI_TUONG
             LEFT JOIN TCHC_CAN_BO cb on (qtkta.LOAI_DOI_TUONG = '02' and qtkta.MA = cb.SHCC)
             LEFT JOIN DM_DON_VI dv on (qtkta.LOAI_DOI_TUONG = '03' and qtkta.MA = TO_CHAR(dv.MA))
             LEFT JOIN DM_BO_MON bm on (qtkta.LOAI_DOI_TUONG = '04' and qtkta.MA = TO_CHAR(bm.MA))
             LEFT JOIN DM_DON_VI dv2 on (bm.MA_DV = dv2.ma)
             LEFT JOIN DM_DON_VI dv3 on (cb.MA_DON_VI = dv3.ma)
             LEFT JOIN DM_KHEN_THUONG_KY_HIEU ktkh ON qtkta.THANH_TICH = ktkh.MA
             LEFT JOIN DM_KHEN_THUONG_CHU_THICH ktct ON qtkta.CHU_THICH = ktct.MA
    WHERE (loaiDoiTuong = '-1' OR (loaiDoiTuong = qtkta.LOAI_DOI_TUONG))
        AND ((list_shcc IS NULL AND list_dv IS NULL)
            OR ((qtkta.LOAI_DOI_TUONG = '02') AND
                ((list_shcc IS NOT NULL AND qtkta.MA IN (SELECT regexp_substr(list_shcc, '[^,]+', 1, level) from dual connect by regexp_substr(list_shcc, '[^,]+', 1, level) is not null))
                OR (list_dv IS NOT NULL AND cb.MA_DON_VI IN (SELECT regexp_substr(list_dv, '[^,]+', 1, level) from dual connect by regexp_substr(list_dv, '[^,]+', 1, level) is not null))
                )))
        AND ((
                (fromYear IS NULL) AND (toYear IS NULL)
            ) OR (
                  (qtkta.NAM_DAT_DUOC IS NOT NULL AND (fromYear IS NULL OR
                   (TO_NUMBER(qtkta.NAM_DAT_DUOC) >= fromYear)))
                  AND (qtkta.NAM_DAT_DUOC IS NOT NULL AND (toYear IS NULL OR
                       (TO_NUMBER(qtkta.NAM_DAT_DUOC) <= toYear)))
            ))
        AND (qtkta.THANH_TICH IS NOT NULL AND (listThanhTich IS NULL OR qtkta.THANH_TICH IN (SELECT regexp_substr(listThanhTich, '[^,]+', 1, level) from dual connect by regexp_substr(listThanhTich, '[^,]+', 1, level) is not null)))
        AND (searchTerm = ''
       OR LOWER(cb.SHCC) LIKE sT
       OR LOWER(TRIM(cb.HO || ' ' || cb.TEN)) LIKE sT
       OR LOWER(TRIM(dv.TEN)) LIKE sT
       OR LOWER(TRIM(bm.TEN)) LIKE sT
       OR LOWER(ldt.TEN) like sT
       OR LOWER(TRIM(ktct.TEN)) LIKE sT
       OR LOWER(TRIM(ktkh.ten)) LIKE sT);

    IF pageNumber < 1 THEN pageNumber := 1; END IF;
    IF pageSize < 1 THEN pageSize := 1; END IF;
    pageTotal := CEIL(totalItem / pageSize);
    pageNumber := LEAST(pageNumber, pageTotal);

    OPEN my_cursor FOR
        SELECT *
        FROM (
                 SELECT qtkta.MA           AS                "ma",
                        qtkta.ID           AS                "id",
                        qtkta.nam_dat_duoc AS                "namDatDuoc",
                        qtkta.DIEM_THI_DUA AS                "diemThiDua",
                        qtkta.SO_QUYET_DINH AS "soQuyetDinh",
                        ldt.MA             AS                "maLoaiDoiTuong",
                        ldt.TEN            AS                "tenLoaiDoiTuong",

                        cb.SHCC            AS                "maCanBo",
                        cb.HO              AS                "hoCanBo",
                        cb.TEN             AS                "tenCanBo",
                        dv3.MA  AS "maDonViCanBo",
                        dv3.TEN AS "tenDonViCanBo",

                        dv.MA              AS                "maDonVi",
                        dv.TEN             AS                "tenDonVi",

                        bm.MA              AS                "maBoMon",
                        bm.TEN             AS                "tenBoMon",
                        bm.MA_DV           AS                "maDonViBoMon",
                        dv2.TEN            AS                "tenDonViBoMon",

                        ktkh.MA            AS                "maThanhTich",
                        ktkh.TEN           AS                "tenThanhTich",

                        ktct.MA            AS                "maChuThich",
                        ktct.TEN           AS                "tenChuThich",
                        ROW_NUMBER() OVER (ORDER BY qtkta.NAM_DAT_DUOC DESC, qtkta.ID DESC) R
                 FROM QT_KHEN_THUONG_ALL qtkta
                          LEFT JOIN DM_KHEN_THUONG_LOAI_DOI_TUONG ldt on ldt.MA = qtkta.LOAI_DOI_TUONG
                          LEFT JOIN TCHC_CAN_BO cb on (qtkta.LOAI_DOI_TUONG = '02' and qtkta.MA = cb.SHCC)
                          LEFT JOIN DM_DON_VI dv on (qtkta.LOAI_DOI_TUONG = '03' and qtkta.MA = TO_CHAR(dv.MA))
                          LEFT JOIN DM_BO_MON bm on (qtkta.LOAI_DOI_TUONG = '04' and qtkta.MA = TO_CHAR(bm.MA))
                          LEFT JOIN DM_DON_VI dv2 on (bm.MA_DV = dv2.ma)
                          LEFT JOIN DM_DON_VI dv3 on (cb.MA_DON_VI = dv3.ma)
                          LEFT JOIN DM_KHEN_THUONG_KY_HIEU ktkh ON qtkta.THANH_TICH = ktkh.MA
                          LEFT JOIN DM_KHEN_THUONG_CHU_THICH ktct ON qtkta.CHU_THICH = ktct.MA
                WHERE (loaiDoiTuong = '-1' OR (loaiDoiTuong = qtkta.LOAI_DOI_TUONG))
                    AND ((list_shcc IS NULL AND list_dv IS NULL)
                        OR ((qtkta.LOAI_DOI_TUONG = '02') AND
                            ((list_shcc IS NOT NULL AND qtkta.MA IN (SELECT regexp_substr(list_shcc, '[^,]+', 1, level) from dual connect by regexp_substr(list_shcc, '[^,]+', 1, level) is not null))
                            OR (list_dv IS NOT NULL AND cb.MA_DON_VI IN (SELECT regexp_substr(list_dv, '[^,]+', 1, level) from dual connect by regexp_substr(list_dv, '[^,]+', 1, level) is not null))
                            )))
                    AND ((
                            (fromYear IS NULL) AND (toYear IS NULL)
                        ) OR (
                              (qtkta.NAM_DAT_DUOC IS NOT NULL AND (fromYear IS NULL OR
                               (TO_NUMBER(qtkta.NAM_DAT_DUOC) >= fromYear)))
                              AND (qtkta.NAM_DAT_DUOC IS NOT NULL AND (toYear IS NULL OR
                                   (TO_NUMBER(qtkta.NAM_DAT_DUOC) <= toYear)))
                        ))
                    AND (qtkta.THANH_TICH IS NOT NULL AND (listThanhTich IS NULL OR qtkta.THANH_TICH IN (SELECT regexp_substr(listThanhTich, '[^,]+', 1, level) from dual connect by regexp_substr(listThanhTich, '[^,]+', 1, level) is not null)))
                    AND (searchTerm = ''
                   OR LOWER(cb.SHCC) LIKE sT
                   OR LOWER(TRIM(cb.HO || ' ' || cb.TEN)) LIKE sT
                   OR LOWER(TRIM(dv.TEN)) LIKE sT
                   OR LOWER(TRIM(bm.TEN)) LIKE sT
                   OR LOWER(ldt.TEN) like sT
                   OR LOWER(TRIM(ktct.TEN)) LIKE sT
                   OR LOWER(TRIM(ktkh.ten)) LIKE sT)
                ORDER BY qtkta.NAM_DAT_DUOC DESC, qtkta.ID DESC
             )
        WHERE R BETWEEN (pageNumber - 1) * pageSize + 1 AND pageNumber * pageSize;
    RETURN my_cursor;

END;

/
--EndMethod--

CREATE OR REPLACE FUNCTION QT_KY_LUAT_DOWNLOAD_EXCEL(filter IN STRING)
    RETURN SYS_REFCURSOR
AS
    my_cursor          SYS_REFCURSOR;
    list_shcc          STRING(100);
    list_dv            STRING(100);
    fromYear           NUMBER;
    toYear             NUMBER;
    listHinhThucKyLuat STRING(100);
BEGIN
    /* Init filter */-------------------------------------------------------------------------------------
    SELECT JSON_VALUE(filter, '$.listDv') INTO list_dv FROM DUAL;
    SELECT JSON_VALUE(filter, '$.listShcc') INTO list_shcc FROM DUAL;
    SELECT JSON_VALUE(filter, '$.fromYear') INTO fromYear FROM DUAL;
    SELECT JSON_VALUE(filter, '$.toYear') INTO toYear FROM DUAL;
    SELECT JSON_VALUE(filter, '$.listHinhThucKyLuat') INTO listHinhThucKyLuat FROM DUAL;

    OPEN my_cursor FOR
        SELECT *
        FROM (SELECT qtkl.ID                   AS                         "id",
                     qtkl.LY_DO_HINH_THUC      AS                         "lyDoHinhThuc",
                     qtkl.DIEM_THI_DUA         AS                         "diemThiDua",
                     qtkl.NOI_DUNG             AS                         "noiDung",
                     qtkl.NGAY_RA_QUYET_DINH   AS                         "ngayRaQuyetDinh",
                     qtkl.SO_QUYET_DINH        AS                         "soQuyetDinh",

                     dmkl.TEN                  AS                         "tenKyLuat",
                     cb.SHCC                   AS                         "maCanBo",
                     cb.HO                     AS                         "hoCanBo",
                     cb.TEN                    AS                         "tenCanBo",

                     dv.MA                     AS                         "maDonVi",
                     dv.TEN                    AS                         "tenDonVi",

                     (SELECT DMCV.TEN
                      FROM QT_CHUC_VU QTCV
                               LEFT JOIN DM_CHUC_VU DMCV ON DMCV.MA = QTCV.MA_CHUC_VU
                      WHERE QTCV.SHCC = CB.SHCC
                        AND CHUC_VU_CHINH = 1) AS                         "tenChucVu",

                     (SELECT QTCV.MA_CHUC_VU
                      FROM QT_CHUC_VU QTCV
                      WHERE QTCV.SHCC = CB.SHCC
                        AND CHUC_VU_CHINH = 1) AS                         "maChucVu",

                     td.MA                     AS                         "maHocVi",
                     td.TEN                    AS                         "tenHocVi",
                     cdnn.MA                   AS                         "maChucDanhNgheNghiep",
                     cdnn.TEN                  AS                         "tenChucDanhNgheNghiep",
                     ROW_NUMBER() OVER (ORDER BY NGAY_RA_QUYET_DINH DESC) R
              FROM QT_KY_LUAT qtkl
                       LEFT JOIN TCHC_CAN_BO cb on qtkl.SHCC = cb.SHCC
                       LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
                       LEFT JOIN DM_KY_LUAT dmkl ON qtkl.LY_DO_HINH_THUC = dmkl.MA
                       LEFT JOIN DM_TRINH_DO td ON (cb.HOC_VI = td.MA)
                       LEFT JOIN DM_NGACH_CDNN cdnn ON (cdnn.MA = cb.NGACH)
              WHERE (((list_shcc IS NULL) AND (list_dv IS NULL) AND (fromYear IS NULL) AND (toYear IS NULL))
                  OR (((list_shcc IS NOT NULL AND cb.SHCC IN (SELECT regexp_substr(list_shcc, '[^,]+', 1, level)
                                                              from dual
                                                              connect by regexp_substr(list_shcc, '[^,]+', 1, level) is not null))
                      OR (list_dv IS NOT NULL AND cb.MA_DON_VI IN (SELECT regexp_substr(list_dv, '[^,]+', 1, level)
                                                                   from dual
                                                                   connect by regexp_substr(list_dv, '[^,]+', 1, level) is not null))
                      OR (list_shcc IS NULL AND list_dv IS NULL))
                      AND (fromYear IS NULL OR
                           (qtkl.NGAY_RA_QUYET_DINH IS NOT NULL AND qtkl.NGAY_RA_QUYET_DINH >= fromYear))
                      AND
                      (toYear IS NULL OR (qtkl.NGAY_RA_QUYET_DINH IS NOT NULL AND qtkl.NGAY_RA_QUYET_DINH <= toYear))))
                AND (listHinhThucKyLuat iS NULL OR
                     qtkl.LY_DO_HINH_THUC IN (SELECT regexp_substr(listHinhThucKyLuat, '[^,]+', 1, level)
                                              from dual
                                              connect by regexp_substr(listHinhThucKyLuat, '[^,]+', 1, level) is not null))
              ORDER BY qtkl.NGAY_RA_QUYET_DINH DESC);
    RETURN my_cursor;

END;

/
--EndMethod--

CREATE OR REPLACE FUNCTION QT_KY_LUAT_GROUP_PAGE(pageNumber IN OUT NUMBER, pageSize IN OUT NUMBER,
                                      filter IN STRING, searchTerm IN STRING,
                                      totalItem OUT NUMBER, pageTotal OUT NUMBER) RETURN SYS_REFCURSOR
AS
    my_cursor          SYS_REFCURSOR;
    sT                 STRING(500) := '%' || lower(searchTerm) || '%';
    list_shcc          STRING(100);
    list_dv            STRING(100);
    fromYear           NUMBER;
    toYear             NUMBER;
    listHinhThucKyLuat STRING(100);
BEGIN
    /* Init filter */-------------------------------------------------------------------------------------
    SELECT JSON_VALUE(filter, '$.listDv') INTO list_dv FROM DUAL;
    SELECT JSON_VALUE(filter, '$.listShcc') INTO list_shcc FROM DUAL;
    SELECT JSON_VALUE(filter, '$.fromYear') INTO fromYear FROM DUAL;
    SELECT JSON_VALUE(filter, '$.toYear') INTO toYear FROM DUAL;
    SELECT JSON_VALUE(filter, '$.listHinhThucKyLuat') INTO listHinhThucKyLuat FROM DUAL;

    SELECT COUNT(*)
    INTO totalItem

    FROM (SELECT *
          FROM QT_KY_LUAT
          WHERE ID IN (SELECT MAX(ID) FROM (SELECT * FROM QT_KY_LUAT ORDER BY SHCC DESC) GROUP BY SHCC)) qtkl
             LEFT JOIN TCHC_CAN_BO cb on qtkl.SHCC = cb.SHCC
             LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = TO_CHAR(dv.MA))
             LEFT JOIN DM_TRINH_DO td ON (cb.HOC_VI = td.MA)
             LEFT JOIN DM_NGACH_CDNN cdnn ON (cdnn.MA = cb.NGACH);

    IF pageNumber < 1 THEN pageNumber := 1; END IF;
    IF pageSize < 1 THEN pageSize := 1; END IF;
    pageTotal := CEIL(totalItem / pageSize);
    pageNumber := LEAST(pageNumber, pageTotal);

    OPEN my_cursor FOR
        SELECT *
        FROM (SELECT qtkl.ID                                               AS  "id",
                     qtkl.SHCC                                             AS  "shcc",

                     (SELECT COUNT(*)
                      FROM QT_KY_LUAT qtkl_temp
                               LEFT JOIN TCHC_CAN_BO cb on qtkl_temp.SHCC = cb.SHCC
                               LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
                               LEFT JOIN DM_KY_LUAT dmkl ON qtkl_temp.LY_DO_HINH_THUC = dmkl.MA
                      WHERE (qtkl_temp.SHCC = qtkl.SHCC)
                        AND (((list_shcc IS NULL) AND (list_dv IS NULL) AND (fromYear IS NULL) AND (toYear IS NULL))
                          OR (((list_shcc IS NOT NULL AND cb.SHCC IN (SELECT regexp_substr(list_shcc, '[^,]+', 1, level)
                                                                      from dual
                                                                      connect by regexp_substr(list_shcc, '[^,]+', 1, level) is not null))
                              OR (list_dv IS NOT NULL AND
                                  cb.MA_DON_VI IN (SELECT regexp_substr(list_dv, '[^,]+', 1, level)
                                                   from dual
                                                   connect by regexp_substr(list_dv, '[^,]+', 1, level) is not null))
                              OR (list_shcc IS NULL AND list_dv IS NULL))
                              AND (fromYear IS NULL OR (qtkl_temp.NGAY_RA_QUYET_DINH IS NOT NULL AND
                                                        qtkl_temp.NGAY_RA_QUYET_DINH >= fromYear))
                              AND (toYear IS NULL OR (qtkl_temp.NGAY_RA_QUYET_DINH IS NOT NULL AND
                                                      qtkl_temp.NGAY_RA_QUYET_DINH <= toYear))))
                        AND (listHinhThucKyLuat iS NULL OR
                             qtkl_temp.LY_DO_HINH_THUC IN (SELECT regexp_substr(listHinhThucKyLuat, '[^,]+', 1, level)
                                                           from dual
                                                           connect by regexp_substr(listHinhThucKyLuat, '[^,]+', 1, level) is not null))
                        AND (searchTerm = ''
                          OR LOWER(cb.SHCC) LIKE sT
                          OR LOWER(qtkl_temp.NOI_DUNG) LIKE sT
                          OR LOWER(dmkl.TEN) LIKE sT
                          OR LOWER(qtkl_temp.SO_QUYET_DINH) LIKE sT
                          OR LOWER(TRIM(cb.HO || ' ' || cb.TEN)) LIKE sT)) AS  "soKyLuat",

                     (select rtrim(xmlagg(xmlelement(e, dmkl.TEN || ' ', '??').extract('//text()') order by
                                          null).getclobval(), '??')
                      FROM QT_KY_LUAT qtkl_temp
                               LEFT JOIN TCHC_CAN_BO cb on qtkl_temp.SHCC = cb.SHCC
                               LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
                               LEFT JOIN DM_KY_LUAT dmkl ON qtkl_temp.LY_DO_HINH_THUC = dmkl.MA
                      WHERE (qtkl_temp.SHCC = qtkl.SHCC)
                        AND (((list_shcc IS NULL) AND (list_dv IS NULL) AND (fromYear IS NULL) AND (toYear IS NULL))
                          OR (((list_shcc IS NOT NULL AND cb.SHCC IN (SELECT regexp_substr(list_shcc, '[^,]+', 1, level)
                                                                      from dual
                                                                      connect by regexp_substr(list_shcc, '[^,]+', 1, level) is not null))
                              OR (list_dv IS NOT NULL AND
                                  cb.MA_DON_VI IN (SELECT regexp_substr(list_dv, '[^,]+', 1, level)
                                                   from dual
                                                   connect by regexp_substr(list_dv, '[^,]+', 1, level) is not null))
                              OR (list_shcc IS NULL AND list_dv IS NULL))
                              AND (fromYear IS NULL OR (qtkl_temp.NGAY_RA_QUYET_DINH IS NOT NULL AND
                                                        qtkl_temp.NGAY_RA_QUYET_DINH >= fromYear))
                              AND (toYear IS NULL OR (qtkl_temp.NGAY_RA_QUYET_DINH IS NOT NULL AND
                                                      qtkl_temp.NGAY_RA_QUYET_DINH <= toYear))))
                        AND (listHinhThucKyLuat iS NULL OR
                             qtkl_temp.LY_DO_HINH_THUC IN (SELECT regexp_substr(listHinhThucKyLuat, '[^,]+', 1, level)
                                                           from dual
                                                           connect by regexp_substr(listHinhThucKyLuat, '[^,]+', 1, level) is not null))
                        AND (searchTerm = ''
                          OR LOWER(cb.SHCC) LIKE sT
                          OR LOWER(qtkl_temp.NOI_DUNG) LIKE sT
                          OR LOWER(dmkl.TEN) LIKE sT
                          OR LOWER(qtkl_temp.SO_QUYET_DINH) LIKE sT
                          OR LOWER(TRIM(cb.HO || ' ' || cb.TEN)) LIKE sT)) AS  "danhSachKyLuat",

                     (select rtrim(xmlagg(xmlelement(e, qtkl_temp.NGAY_RA_QUYET_DINH || ' ', '??').extract('//text()')
                                          order by null).getclobval(), '??')
                      FROM QT_KY_LUAT qtkl_temp
                               LEFT JOIN TCHC_CAN_BO cb on qtkl_temp.SHCC = cb.SHCC
                               LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
                               LEFT JOIN DM_KY_LUAT dmkl ON qtkl_temp.LY_DO_HINH_THUC = dmkl.MA
                      WHERE (qtkl_temp.SHCC = qtkl.SHCC)
                        AND (((list_shcc IS NULL) AND (list_dv IS NULL) AND (fromYear IS NULL) AND (toYear IS NULL))
                          OR (((list_shcc IS NOT NULL AND cb.SHCC IN (SELECT regexp_substr(list_shcc, '[^,]+', 1, level)
                                                                      from dual
                                                                      connect by regexp_substr(list_shcc, '[^,]+', 1, level) is not null))
                              OR (list_dv IS NOT NULL AND
                                  cb.MA_DON_VI IN (SELECT regexp_substr(list_dv, '[^,]+', 1, level)
                                                   from dual
                                                   connect by regexp_substr(list_dv, '[^,]+', 1, level) is not null))
                              OR (list_shcc IS NULL AND list_dv IS NULL))
                              AND (fromYear IS NULL OR (qtkl_temp.NGAY_RA_QUYET_DINH IS NOT NULL AND
                                                        qtkl_temp.NGAY_RA_QUYET_DINH >= fromYear))
                              AND (toYear IS NULL OR (qtkl_temp.NGAY_RA_QUYET_DINH IS NOT NULL AND
                                                      qtkl_temp.NGAY_RA_QUYET_DINH <= toYear))))
                        AND (listHinhThucKyLuat iS NULL OR
                             qtkl_temp.LY_DO_HINH_THUC IN (SELECT regexp_substr(listHinhThucKyLuat, '[^,]+', 1, level)
                                                           from dual
                                                           connect by regexp_substr(listHinhThucKyLuat, '[^,]+', 1, level) is not null))
                        AND (searchTerm = ''
                          OR LOWER(cb.SHCC) LIKE sT
                          OR LOWER(qtkl_temp.NOI_DUNG) LIKE sT
                          OR LOWER(dmkl.TEN) LIKE sT
                          OR LOWER(qtkl_temp.SO_QUYET_DINH) LIKE sT
                          OR LOWER(TRIM(cb.HO || ' ' || cb.TEN)) LIKE sT)) AS  "danhSachNgayRaQd",
                     cb.SHCC                                               AS  "maCanBo",
                     cb.HO                                                 AS  "hoCanBo",
                     cb.TEN                                                AS  "tenCanBo",

                     dv.MA                                                 AS  "maDonVi",
                     dv.TEN                                                AS  "tenDonVi",
                     (SELECT DMCV.TEN
                      FROM QT_CHUC_VU QTCV
                               LEFT JOIN DM_CHUC_VU DMCV ON DMCV.MA = QTCV.MA_CHUC_VU
                      WHERE QTCV.SHCC = CB.SHCC
                        AND CHUC_VU_CHINH = 1)                             AS  "tenChucVu",

                     (SELECT QTCV.MA_CHUC_VU
                      FROM QT_CHUC_VU QTCV
                      WHERE QTCV.SHCC = CB.SHCC
                        AND CHUC_VU_CHINH = 1)                             AS  "maChucVu",

                     td.MA                                                 AS  "maHocVi",
                     td.TEN                                                AS  "tenHocVi",
                     cdnn.MA                                               AS  "maChucDanhNgheNghiep",
                     cdnn.TEN                                              AS  "tenChucDanhNgheNghiep",
                     ROW_NUMBER() OVER (ORDER BY qtkl.NGAY_RA_QUYET_DINH DESC) R
              FROM (SELECT *
                    FROM QT_KY_LUAT
                    WHERE ID IN (SELECT MAX(ID) FROM (SELECT * FROM QT_KY_LUAT ORDER BY SHCC DESC) GROUP BY SHCC)) qtkl
                       LEFT JOIN TCHC_CAN_BO cb on qtkl.SHCC = cb.SHCC
                       LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = TO_CHAR(dv.MA))
                       LEFT JOIN DM_TRINH_DO td ON (cb.HOC_VI = td.MA)
                       LEFT JOIN DM_NGACH_CDNN cdnn ON (cdnn.MA = cb.NGACH)
              ORDER BY qtkl.NGAY_RA_QUYET_DINH DESC)
        WHERE R BETWEEN (pageNumber - 1) * pageSize + 1 AND pageNumber * pageSize;
    RETURN my_cursor;

END;

/
--EndMethod--

CREATE OR REPLACE FUNCTION QT_KY_LUAT_SEARCH_PAGE(pageNumber IN OUT NUMBER, pageSize IN OUT NUMBER,
                                        filter IN STRING, searchTerm IN STRING,
                                         totalItem OUT NUMBER, pageTotal OUT NUMBER) RETURN SYS_REFCURSOR
AS
    my_cursor SYS_REFCURSOR;
    sT        STRING(500) := '%' || lower(searchTerm) || '%';
    list_shcc STRING(100);
    list_dv STRING(100);
    fromYear NUMBER;
    toYear NUMBER;
    listHinhThucKyLuat STRING(100);
BEGIN
    /* Init filter */-------------------------------------------------------------------------------------
    SELECT JSON_VALUE(filter, '$.listDv') INTO list_dv FROM DUAL;
    SELECT JSON_VALUE(filter, '$.listShcc') INTO list_shcc FROM DUAL;
    SELECT JSON_VALUE(filter, '$.fromYear') INTO fromYear FROM DUAL;
    SELECT JSON_VALUE(filter, '$.toYear') INTO toYear FROM DUAL;
    SELECT JSON_VALUE(filter, '$.listHinhThucKyLuat') INTO listHinhThucKyLuat FROM DUAL;

    SELECT COUNT(*)
    INTO totalItem

    FROM QT_KY_LUAT qtkl
             LEFT JOIN TCHC_CAN_BO cb on qtkl.SHCC = cb.SHCC
             LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
             LEFT JOIN DM_KY_LUAT dmkl ON qtkl.LY_DO_HINH_THUC = dmkl.MA
             LEFT JOIN DM_TRINH_DO td ON (cb.HOC_VI = td.MA)
             LEFT JOIN DM_NGACH_CDNN cdnn ON (cdnn.MA = cb.NGACH)
    WHERE (((list_shcc IS NULL) AND (list_dv IS NULL) AND (fromYear IS NULL) AND (toYear IS NULL))
        OR (((list_shcc IS NOT NULL AND cb.SHCC IN (SELECT regexp_substr(list_shcc, '[^,]+', 1, level) from dual connect by regexp_substr(list_shcc, '[^,]+', 1, level) is not null))
      OR (list_dv IS NOT NULL AND cb.MA_DON_VI IN (SELECT regexp_substr(list_dv, '[^,]+', 1, level) from dual connect by regexp_substr(list_dv, '[^,]+', 1, level) is not null))
      OR (list_shcc IS NULL AND list_dv IS NULL))
      AND (fromYear IS NULL OR (qtkl.NGAY_RA_QUYET_DINH IS NOT NULL AND qtkl.NGAY_RA_QUYET_DINH >= fromYear))
      AND (toYear IS NULL OR (qtkl.NGAY_RA_QUYET_DINH IS NOT NULL AND qtkl.NGAY_RA_QUYET_DINH <= toYear))))
      AND (listHinhThucKyLuat iS NULL OR qtkl.LY_DO_HINH_THUC IN (SELECT regexp_substr(listHinhThucKyLuat, '[^,]+', 1, level) from dual connect by regexp_substr(listHinhThucKyLuat, '[^,]+', 1, level) is not null))
      AND (searchTerm = ''
       OR LOWER(cb.SHCC) LIKE sT
       OR LOWER(qtkl.NOI_DUNG) LIKE sT
       OR LOWER(dmkl.TEN) LIKE sT
       OR LOWER(qtkl.SO_QUYET_DINH) LIKE sT
       OR LOWER(TRIM(cb.HO || ' ' || cb.TEN)) LIKE sT);

    IF pageNumber < 1 THEN pageNumber := 1; END IF;
    IF pageSize < 1 THEN pageSize := 1; END IF;
    pageTotal := CEIL(totalItem / pageSize);
    pageNumber := LEAST(pageNumber, pageTotal);

    OPEN my_cursor FOR
        SELECT *
        FROM (
                 SELECT qtkl.ID           AS                "id",
                        qtkl.SHCC   AS "shcc",
                        qtkl.LY_DO_HINH_THUC    AS "lyDoHinhThuc",
                        qtkl.DIEM_THI_DUA   AS "diemThiDua",
                        qtkl.NOI_DUNG   AS "noiDung",
                        qtkl.NGAY_RA_QUYET_DINH AS "ngayRaQuyetDinh",
                        qtkl.SO_QUYET_DINH AS "soQuyetDinh",

                        dmkl.TEN           AS   "tenKyLuat",
                        cb.SHCC            AS                "maCanBo",
                        cb.HO              AS                "hoCanBo",
                        cb.TEN             AS                "tenCanBo",

                        dv.MA              AS                "maDonVi",
                        dv.TEN             AS                "tenDonVi",

                         (SELECT DMCV.TEN
                      FROM QT_CHUC_VU QTCV
                               LEFT JOIN DM_CHUC_VU DMCV ON DMCV.MA = QTCV.MA_CHUC_VU
                      WHERE QTCV.SHCC = CB.SHCC
                        AND CHUC_VU_CHINH = 1)                        AS "tenChucVu",

                     (SELECT QTCV.MA_CHUC_VU
                      FROM QT_CHUC_VU QTCV
                      WHERE QTCV.SHCC = CB.SHCC
                        AND CHUC_VU_CHINH = 1)                        AS "maChucVu",

                        td.MA   AS "maHocVi",
                        td.TEN  AS "tenHocVi",

                        cdnn.MA AS "maChucDanhNgheNghiep",
                        cdnn.TEN AS "tenChucDanhNgheNghiep",
                        ROW_NUMBER() OVER (ORDER BY NGAY_RA_QUYET_DINH DESC) R
                FROM QT_KY_LUAT qtkl
                         LEFT JOIN TCHC_CAN_BO cb on qtkl.SHCC = cb.SHCC
                         LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
                         LEFT JOIN DM_KY_LUAT dmkl ON qtkl.LY_DO_HINH_THUC = dmkl.MA
                         LEFT JOIN DM_TRINH_DO td ON (cb.HOC_VI = td.MA)
                         LEFT JOIN DM_NGACH_CDNN cdnn ON (cdnn.MA = cb.NGACH)
                WHERE (((list_shcc IS NULL) AND (list_dv IS NULL) AND (fromYear IS NULL) AND (toYear IS NULL))
                    OR (((list_shcc IS NOT NULL AND cb.SHCC IN (SELECT regexp_substr(list_shcc, '[^,]+', 1, level) from dual connect by regexp_substr(list_shcc, '[^,]+', 1, level) is not null))
                  OR (list_dv IS NOT NULL AND cb.MA_DON_VI IN (SELECT regexp_substr(list_dv, '[^,]+', 1, level) from dual connect by regexp_substr(list_dv, '[^,]+', 1, level) is not null))
                  OR (list_shcc IS NULL AND list_dv IS NULL))
                  AND (fromYear IS NULL OR (qtkl.NGAY_RA_QUYET_DINH IS NOT NULL AND qtkl.NGAY_RA_QUYET_DINH >= fromYear))
                  AND (toYear IS NULL OR (qtkl.NGAY_RA_QUYET_DINH IS NOT NULL AND qtkl.NGAY_RA_QUYET_DINH <= toYear))))
                  AND (listHinhThucKyLuat iS NULL OR qtkl.LY_DO_HINH_THUC IN (SELECT regexp_substr(listHinhThucKyLuat, '[^,]+', 1, level) from dual connect by regexp_substr(listHinhThucKyLuat, '[^,]+', 1, level) is not null))
                  AND (searchTerm = ''
                   OR LOWER(cb.SHCC) LIKE sT
                   OR LOWER(qtkl.NOI_DUNG) LIKE sT
                   OR LOWER(dmkl.TEN) LIKE sT
                   OR LOWER(qtkl.SO_QUYET_DINH) LIKE sT
                   OR LOWER(TRIM(cb.HO || ' ' || cb.TEN)) LIKE sT)
                 ORDER BY qtkl.NGAY_RA_QUYET_DINH DESC
             )
        WHERE R BETWEEN (pageNumber - 1) * pageSize + 1 AND pageNumber * pageSize;
    RETURN my_cursor;

END;

/
--EndMethod--

CREATE OR REPLACE FUNCTION QT_LAM_VIEC_NGOAI_GROUP_PAGE(pageNumber IN OUT NUMBER, pageSize IN OUT NUMBER,
                                             list_shcc IN STRING, list_dv IN STRING,
                                             fromYear IN NUMBER, toYear IN NUMBER, tinhTrang IN NUMBER,
                                             searchTerm IN STRING,
                                             totalItem OUT NUMBER, pageTotal OUT NUMBER) RETURN SYS_REFCURSOR
AS
    my_cursor SYS_REFCURSOR;
    sT        STRING(500) := '%' || lower(searchTerm) || '%';
    today     NUMBER;
BEGIN
    select (cast(sysdate as date) - cast(to_date('1970-01-01', 'YYYY-MM-DD') as date)) * 86400000 into today from dual;
    SELECT COUNT(*)
    INTO totalItem
    FROM (SELECT *
          FROM QT_LAM_VIEC_NGOAI
          WHERE ID IN (SELECT MAX(ID) FROM (SELECT * FROM QT_LAM_VIEC_NGOAI ORDER BY SHCC DESC) GROUP BY SHCC)) qtlvn
             LEFT JOIN TCHC_CAN_BO cb on qtlvn.SHCC = cb.SHCC
             LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
             LEFT JOIN DM_TRINH_DO td ON (cb.HOC_VI = td.MA)
             LEFT JOIN DM_NGACH_CDNN cdnn ON (cdnn.MA = cb.NGACH);
    IF pageNumber < 1 THEN pageNumber := 1; END IF;
    IF pageSize < 1 THEN pageSize := 1; END IF;
    pageTotal := CEIL(totalItem / pageSize);
    pageNumber := LEAST(pageNumber, pageTotal);

    OPEN my_cursor FOR
        SELECT *
        FROM (SELECT qtlvn.ID                                         AS "id",
                     qtlvn.SHCC                                       AS "shcc",

                     cb.HO                                            AS "hoCanBo",
                     cb.TEN                                           AS "tenCanBo",

                     (SELECT COUNT(*)
                      FROM QT_LAM_VIEC_NGOAI qtlvn_temp
                               LEFT JOIN TCHC_CAN_BO cb on qtlvn_temp.SHCC = cb.SHCC
                               LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
                      WHERE (qtlvn_temp.SHCC = qtlvn.SHCC)
                        AND (((list_shcc IS NULL) AND (list_dv IS NULL) AND (fromYear IS NULL) AND (toYear IS NULL) AND
                              (tinhTrang IS NULL))
                          OR (((list_shcc IS NOT NULL AND cb.SHCC IN (SELECT regexp_substr(list_shcc, '[^,]+', 1, level)
                                                                      from dual
                                                                      connect by regexp_substr(list_shcc, '[^,]+', 1, level) is not null))
                              OR (list_dv IS NOT NULL AND
                                  cb.MA_DON_VI IN (SELECT regexp_substr(list_dv, '[^,]+', 1, level)
                                                   from dual
                                                   connect by regexp_substr(list_dv, '[^,]+', 1, level) is not null))
                              OR (list_shcc IS NULL AND list_dv IS NULL))
                              AND ((qtlvn_temp.BAT_DAU IS NOT NULL AND
                                    (fromYear IS NULL OR qtlvn_temp.BAT_DAU >= fromYear)) AND
                                   (toYear IS NULL OR qtlvn_temp.BAT_DAU <= toYear)
                                  ))
                                 AND (tinhTrang IS NULL OR
                                      ((qtlvn_temp.KET_THUC = -1 OR qtlvn_temp.KET_THUC >= today) AND tinhTrang = 2) OR
                                      (qtlvn_temp.KET_THUC IS NOT NULL AND qtlvn_temp.KET_THUC != -1 AND
                                       qtlvn_temp.KET_THUC < today AND tinhTrang = 1)))
                        AND (searchTerm = ''
                          OR LOWER(cb.SHCC) LIKE sT
                          OR LOWER(TRIM(cb.HO || ' ' || cb.TEN)) LIKE sT
                          OR LOWER(qtlvn_temp.NOI_DUNG) LIKE sT
                          OR LOWER(qtlvn_temp.NOI_LAM_VIEC) LIKE sT)) AS "soQuaTrinh",

                     (select rtrim(xmlagg(xmlelement(e, qtlvn_temp.NOI_DUNG || ' ', '??').extract('//text()') order by
                                          null).getclobval(), '??')
                      FROM QT_LAM_VIEC_NGOAI qtlvn_temp
                               LEFT JOIN TCHC_CAN_BO cb on qtlvn_temp.SHCC = cb.SHCC
                               LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
                      WHERE (qtlvn_temp.SHCC = qtlvn.SHCC)
                        AND (((list_shcc IS NULL) AND (list_dv IS NULL) AND (fromYear IS NULL) AND (toYear IS NULL) AND
                              (tinhTrang IS NULL))
                          OR (((list_shcc IS NOT NULL AND cb.SHCC IN (SELECT regexp_substr(list_shcc, '[^,]+', 1, level)
                                                                      from dual
                                                                      connect by regexp_substr(list_shcc, '[^,]+', 1, level) is not null))
                              OR (list_dv IS NOT NULL AND
                                  cb.MA_DON_VI IN (SELECT regexp_substr(list_dv, '[^,]+', 1, level)
                                                   from dual
                                                   connect by regexp_substr(list_dv, '[^,]+', 1, level) is not null))
                              OR (list_shcc IS NULL AND list_dv IS NULL))
                              AND ((qtlvn_temp.BAT_DAU IS NOT NULL AND
                                    (fromYear IS NULL OR qtlvn_temp.BAT_DAU >= fromYear)) AND
                                   (toYear IS NULL OR qtlvn_temp.BAT_DAU <= toYear)
                                  ))
                                 AND (tinhTrang IS NULL OR
                                      ((qtlvn_temp.KET_THUC = -1 OR qtlvn_temp.KET_THUC >= today) AND tinhTrang = 2) OR
                                      (qtlvn_temp.KET_THUC IS NOT NULL AND qtlvn_temp.KET_THUC != -1 AND
                                       qtlvn_temp.KET_THUC < today AND tinhTrang = 1)))
                        AND (searchTerm = ''
                          OR LOWER(cb.SHCC) LIKE sT
                          OR LOWER(TRIM(cb.HO || ' ' || cb.TEN)) LIKE sT
                          OR LOWER(qtlvn_temp.NOI_DUNG) LIKE sT
                          OR LOWER(qtlvn_temp.NOI_LAM_VIEC) LIKE sT)) AS "danhSachNoiDung",
                     dv.MA                                            AS "maDonVi",
                     dv.TEN                                           AS "tenDonVi",
                     (SELECT DMCV.TEN
                      FROM QT_CHUC_VU QTCV
                               LEFT JOIN DM_CHUC_VU DMCV ON DMCV.MA = QTCV.MA_CHUC_VU
                      WHERE QTCV.SHCC = CB.SHCC
                        AND CHUC_VU_CHINH = 1)                        AS "tenChucVu",

                     (SELECT QTCV.MA_CHUC_VU
                      FROM QT_CHUC_VU QTCV
                      WHERE QTCV.SHCC = CB.SHCC
                        AND CHUC_VU_CHINH = 1)                        AS "maChucVu",

                     td.MA                                            AS "maHocVi",
                     td.TEN                                           AS "tenHocVi",

                     cdnn.MA                                          AS "maChucDanhNgheNghiep",
                     cdnn.TEN                                         AS "tenChucDanhNgheNghiep",
                     ROW_NUMBER() OVER (ORDER BY BAT_DAU DESC)           R
              FROM (SELECT *
                    FROM QT_LAM_VIEC_NGOAI
                    WHERE ID IN (SELECT MAX(ID)
                                 FROM (SELECT * FROM QT_LAM_VIEC_NGOAI ORDER BY SHCC DESC)
                                 GROUP BY SHCC)) qtlvn
                       LEFT JOIN TCHC_CAN_BO cb on qtlvn.SHCC = cb.SHCC
                       LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
                       LEFT JOIN DM_TRINH_DO td ON (cb.HOC_VI = td.MA)
                       LEFT JOIN DM_NGACH_CDNN cdnn ON (cdnn.MA = cb.NGACH)
              ORDER BY qtlvn.BAT_DAU DESC)
        WHERE R BETWEEN (pageNumber - 1) * pageSize + 1 AND pageNumber * pageSize;
    RETURN my_cursor;

END;

/
--EndMethod--

CREATE OR REPLACE FUNCTION QT_LAM_VIEC_NGOAI_SEARCH_PAGE(pageNumber IN OUT NUMBER, pageSize IN OUT NUMBER,
                                              list_shcc IN STRING, list_dv IN STRING,
                                              fromYear IN NUMBER, toYear IN NUMBER, tinhTrang IN NUMBER,
                                              searchTerm IN STRING,
                                              totalItem OUT NUMBER, pageTotal OUT NUMBER) RETURN SYS_REFCURSOR
AS
    my_cursor SYS_REFCURSOR;
    sT        STRING(500) := '%' || lower(searchTerm) || '%';
    today     NUMBER(20);
BEGIN
    select (cast(sysdate as date) - cast(to_date('1970-01-01', 'YYYY-MM-DD') as date)) * 86400000 into today from dual;
    SELECT COUNT(*)
    INTO totalItem

    FROM QT_LAM_VIEC_NGOAI qtlvn
             LEFT JOIN TCHC_CAN_BO cb on qtlvn.SHCC = cb.SHCC
             LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
             LEFT JOIN DM_TRINH_DO td ON (cb.HOC_VI = td.MA)
             LEFT JOIN DM_NGACH_CDNN cdnn ON (cdnn.MA = cb.NGACH)
    WHERE (((list_shcc IS NULL) AND (list_dv IS NULL) AND (fromYear IS NULL) AND (toYear IS NULL) AND
            (tinhTrang IS NULL))
        OR (((list_shcc IS NOT NULL AND cb.SHCC IN (SELECT regexp_substr(list_shcc, '[^,]+', 1, level)
                                                    from dual
                                                    connect by regexp_substr(list_shcc, '[^,]+', 1, level) is not null))
            OR (list_dv IS NOT NULL AND cb.MA_DON_VI IN (SELECT regexp_substr(list_dv, '[^,]+', 1, level)
                                                         from dual
                                                         connect by regexp_substr(list_dv, '[^,]+', 1, level) is not null))
            OR (list_shcc IS NULL AND list_dv IS NULL))
            AND ((qtlvn.BAT_DAU IS NOT NULL AND (fromYear IS NULL OR qtlvn.BAT_DAU >= fromYear)) AND
                 (toYear IS NULL OR qtlvn.BAT_DAU <= toYear)
                ))
               AND (tinhTrang IS NULL OR ((qtlvn.KET_THUC = -1 OR qtlvn.KET_THUC >= today) AND tinhTrang = 2) OR
                    (qtlvn.KET_THUC IS NOT NULL AND qtlvn.KET_THUC != -1 AND qtlvn.KET_THUC < today AND tinhTrang = 1)))
      AND (searchTerm = ''
        OR LOWER(cb.SHCC) LIKE sT
        OR LOWER(TRIM(cb.HO || ' ' || cb.TEN)) LIKE sT
        OR LOWER(qtlvn.NOI_DUNG) LIKE sT
        OR LOWER(qtlvn.NOI_LAM_VIEC) LIKE sT);

    IF pageNumber < 1 THEN pageNumber := 1; END IF;
    IF pageSize < 1 THEN pageSize := 1; END IF;
    pageTotal := CEIL(totalItem / pageSize);
    pageNumber := LEAST(pageNumber, pageTotal);

    OPEN my_cursor FOR
        SELECT *
        FROM (SELECT qtlvn.ID                  AS              "id",
                     qtlvn.NOI_DUNG            AS              "noiDung",
                     qtlvn.NOI_LAM_VIEC        AS              "noiLamViec",
                     qtlvn.BAT_DAU             AS              "batDau",
                     qtlvn.BAT_DAU_TYPE        AS              "batDauType",
                     qtlvn.KET_THUC            AS              "ketThuc",
                     qtlvn.KET_THUC_TYPE       AS              "ketThucType",
                     qtlvn.SHCC                AS              "shcc",

                     today                     AS              "today",
                     cb.HO                     AS              "hoCanBo",
                     cb.TEN                    AS              "tenCanBo",

                     dv.MA                     AS              "maDonVi",
                     dv.TEN                    AS              "tenDonVi",
                     (SELECT DMCV.TEN
                      FROM QT_CHUC_VU QTCV
                               LEFT JOIN DM_CHUC_VU DMCV ON DMCV.MA = QTCV.MA_CHUC_VU
                      WHERE QTCV.SHCC = CB.SHCC
                        AND CHUC_VU_CHINH = 1) AS              "tenChucVu",

                     (SELECT QTCV.MA_CHUC_VU
                      FROM QT_CHUC_VU QTCV
                      WHERE QTCV.SHCC = CB.SHCC
                        AND CHUC_VU_CHINH = 1) AS              "maChucVu",
                     td.MA                     AS              "maHocVi",
                     td.TEN                    AS              "tenHocVi",

                     cdnn.MA                   AS              "maChucDanhNgheNghiep",
                     cdnn.TEN                  AS              "tenChucDanhNgheNghiep",
                     ROW_NUMBER() OVER (ORDER BY BAT_DAU DESC) R
              FROM QT_LAM_VIEC_NGOAI qtlvn
                       LEFT JOIN TCHC_CAN_BO cb on qtlvn.SHCC = cb.SHCC
                       LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
                       LEFT JOIN DM_TRINH_DO td ON (cb.HOC_VI = td.MA)
                       LEFT JOIN DM_NGACH_CDNN cdnn ON (cdnn.MA = cb.NGACH)
              WHERE (((list_shcc IS NULL) AND (list_dv IS NULL) AND (fromYear IS NULL) AND (toYear IS NULL) AND
                      (tinhTrang IS NULL))
                  OR (((list_shcc IS NOT NULL AND cb.SHCC IN (SELECT regexp_substr(list_shcc, '[^,]+', 1, level)
                                                              from dual
                                                              connect by regexp_substr(list_shcc, '[^,]+', 1, level) is not null))
                      OR (list_dv IS NOT NULL AND cb.MA_DON_VI IN (SELECT regexp_substr(list_dv, '[^,]+', 1, level)
                                                                   from dual
                                                                   connect by regexp_substr(list_dv, '[^,]+', 1, level) is not null))
                      OR (list_shcc IS NULL AND list_dv IS NULL))
                      AND ((qtlvn.BAT_DAU IS NOT NULL AND (fromYear IS NULL OR qtlvn.BAT_DAU >= fromYear)) AND
                           (toYear IS NULL OR qtlvn.BAT_DAU <= toYear)
                          ))
                         AND
                     (tinhTrang IS NULL OR ((qtlvn.KET_THUC = -1 OR qtlvn.KET_THUC >= today) AND tinhTrang = 2) OR
                      (qtlvn.KET_THUC IS NOT NULL AND qtlvn.KET_THUC != -1 AND qtlvn.KET_THUC < today AND
                       tinhTrang = 1)))
                AND (searchTerm = ''
                  OR LOWER(cb.SHCC) LIKE sT
                  OR LOWER(TRIM(cb.HO || ' ' || cb.TEN)) LIKE sT
                  OR LOWER(qtlvn.NOI_DUNG) LIKE sT
                  OR LOWER(qtlvn.NOI_LAM_VIEC) LIKE sT)
              ORDER BY qtlvn.BAT_DAU DESC)
        WHERE R BETWEEN (pageNumber - 1) * pageSize + 1 AND pageNumber * pageSize;
    RETURN my_cursor;

END;

/
--EndMethod--

CREATE OR REPLACE FUNCTION QT_LUONG_GROUP_PAGE(pageNumber IN OUT NUMBER, pageSize IN OUT NUMBER,
                                        list_shcc IN STRING, list_dv IN STRING,
                                        fromYear IN NUMBER, toYear IN NUMBER, timeType IN NUMBER, tinhTrang IN NUMBER, searchTerm IN STRING,
                                         totalItem OUT NUMBER, pageTotal OUT NUMBER) RETURN SYS_REFCURSOR
AS
    my_cursor SYS_REFCURSOR;
    sT        STRING(500) := '%' || lower(searchTerm) || '%';
    today   NUMBER;
BEGIN
    select (cast(sysdate as date) - cast(to_date('1970-01-01', 'YYYY-MM-DD') as date)) * 86400000 into today from dual;
    SELECT COUNT(*)
    INTO totalItem

    FROM (SELECT *
          FROM QT_LUONG
          WHERE ID IN (SELECT MAX(ID) FROM (SELECT * FROM QT_LUONG ORDER BY SHCC DESC) GROUP BY SHCC)) qtl
             LEFT JOIN TCHC_CAN_BO cb on qtl.SHCC = cb.SHCC;

    IF pageNumber < 1 THEN pageNumber := 1; END IF;
    IF pageSize < 1 THEN pageSize := 1; END IF;
    pageTotal := CEIL(totalItem / pageSize);
    pageNumber := LEAST(pageNumber, pageTotal);

    OPEN my_cursor FOR
        SELECT *
        FROM (
                 SELECT
                        qtl.SHCC    as "shcc",
                        qtl.ID                              AS  "id",
                        cb.HO                               AS  "ho",
                        cb.TEN                              AS  "ten",
                        (SELECT COUNT(*)
                        FROM QT_LUONG qtl_temp
                                 LEFT JOIN TCHC_CAN_BO cb on qtl_temp.SHCC = cb.SHCC
                                 LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
                        WHERE (qtl_temp.SHCC = qtl.SHCC)
                            AND (((list_shcc IS NULL) AND (list_dv IS NULL) AND (fromYear IS NULL) AND (toYear IS NULL) AND (timeType = 0) AND (tinhTrang IS NULL))
                            OR (((list_shcc IS NOT NULL AND ((INSTR(list_shcc, ',') != 0 AND INSTR(list_shcc, qtl_temp.SHCC) != 0) OR (list_shcc = qtl_temp.SHCC)))
                          OR (list_dv IS NOT NULL AND INSTR(list_dv, cb.MA_DON_VI) != 0)
                          OR (list_shcc IS NULL AND list_dv IS NULL))
                          AND (timeType = 0 OR (
                                timeType = 1 AND (qtl_temp.BAT_DAU IS NOT NULL AND (fromYear IS NULL OR qtl_temp.BAT_DAU >= fromYear)) AND (toYear IS NULL OR qtl_temp.BAT_DAU <= toYear)
                              ) OR (
                                timeType = 2 AND (qtl_temp.NGAY_HUONG IS NOT NULL AND (fromYear IS NULL OR qtl_temp.NGAY_HUONG >= fromYear) AND (toYear IS NULL OR qtl_temp.NGAY_HUONG <= toYear))
                                    ))
                          AND (tinhTrang IS NULL OR ((qtl_temp.KET_THUC = -1 OR qtl_temp.KET_THUC >= today) AND tinhTrang = 2) OR
                            (qtl_temp.KET_THUC IS NOT NULL AND qtl_temp.KET_THUC != -1 AND qtl_temp.KET_THUC < today AND tinhTrang = 1))))
                            AND (searchTerm = ''
                            OR LOWER(cb.SHCC) LIKE sT
                            OR LOWER(TRIM(cb.HO || ' ' || cb.TEN)) LIKE sT
                            OR LOWER(qtl_temp.CHUC_DANH_NGHE_NGHIEP) LIKE sT
                            OR LOWER(qtl_temp.SO_HIEU_VAN_BAN) LIKE sT)
                        ) AS "soNgayHuong",

                        (select rtrim(xmlagg(xmlelement(e, qtl_temp.NGAY_HUONG || ' ','??').extract('//text()') order by null).getclobval(),'??')
                        FROM QT_LUONG qtl_temp
                             LEFT JOIN TCHC_CAN_BO cb on qtl_temp.SHCC = cb.SHCC
                             LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
                        WHERE (qtl_temp.SHCC = qtl.SHCC)
                            AND (((list_shcc IS NULL) AND (list_dv IS NULL) AND (fromYear IS NULL) AND (toYear IS NULL) AND (timeType = 0) AND (tinhTrang IS NULL))
                            OR (((list_shcc IS NOT NULL AND ((INSTR(list_shcc, ',') != 0 AND INSTR(list_shcc, qtl_temp.SHCC) != 0) OR (list_shcc = qtl_temp.SHCC)))
                          OR (list_dv IS NOT NULL AND INSTR(list_dv, cb.MA_DON_VI) != 0)
                          OR (list_shcc IS NULL AND list_dv IS NULL))
                          AND (timeType = 0 OR (
                                timeType = 1 AND (qtl_temp.BAT_DAU IS NOT NULL AND (fromYear IS NULL OR qtl_temp.BAT_DAU >= fromYear)) AND (toYear IS NULL OR qtl_temp.BAT_DAU <= toYear)
                              ) OR (
                                timeType = 2 AND (qtl_temp.NGAY_HUONG IS NOT NULL AND (fromYear IS NULL OR qtl_temp.NGAY_HUONG >= fromYear) AND (toYear IS NULL OR qtl_temp.NGAY_HUONG <= toYear))
                                    ))
                          AND (tinhTrang IS NULL OR ((qtl_temp.KET_THUC = -1 OR qtl_temp.KET_THUC >= today) AND tinhTrang = 2) OR
                            (qtl_temp.KET_THUC IS NOT NULL AND qtl_temp.KET_THUC != -1 AND qtl_temp.KET_THUC < today AND tinhTrang = 1))))
                            AND (searchTerm = ''
                            OR LOWER(cb.SHCC) LIKE sT
                            OR LOWER(TRIM(cb.HO || ' ' || cb.TEN)) LIKE sT
                            OR LOWER(qtl_temp.CHUC_DANH_NGHE_NGHIEP) LIKE sT
                            OR LOWER(qtl_temp.SO_HIEU_VAN_BAN) LIKE sT)
                        ) AS "danhSachNgayHuong",
                        ROW_NUMBER() OVER (ORDER BY qtl.NGAY_HUONG DESC) R
                     FROM (SELECT *
                          FROM QT_LUONG
                          WHERE ID IN (SELECT MAX(ID) FROM (SELECT * FROM QT_LUONG ORDER BY SHCC DESC) GROUP BY SHCC)) qtl
                                          LEFT JOIN TCHC_CAN_BO cb on qtl.SHCC = cb.SHCC
                ORDER BY qtl.NGAY_HUONG DESC
             )
        WHERE R BETWEEN (pageNumber - 1) * pageSize + 1 AND pageNumber * pageSize;
    RETURN my_cursor;

END;

/
--EndMethod--

CREATE OR REPLACE FUNCTION QT_LUONG_SEARCH_PAGE(pageNumber IN OUT NUMBER, pageSize IN OUT NUMBER,
                                        list_shcc IN STRING, list_dv IN STRING,
                                        fromYear IN NUMBER, toYear IN NUMBER, timeType IN NUMBER, tinhTrang IN NUMBER, searchTerm IN STRING,
                                         totalItem OUT NUMBER, pageTotal OUT NUMBER) RETURN SYS_REFCURSOR
AS
    my_cursor SYS_REFCURSOR;
    sT        STRING(500) := '%' || lower(searchTerm) || '%';
    today   NUMBER;
BEGIN
    select (cast(sysdate as date) - cast(to_date('1970-01-01', 'YYYY-MM-DD') as date)) * 86400000 into today from dual;
    SELECT COUNT(*)
    INTO totalItem

    FROM QT_LUONG qtl
             LEFT JOIN TCHC_CAN_BO cb on qtl.SHCC = cb.SHCC
             LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
    WHERE (((list_shcc IS NULL) AND (list_dv IS NULL) AND (fromYear IS NULL) AND (toYear IS NULL) AND (timeType = 0) AND (tinhTrang IS NULL))
        OR (((list_shcc IS NOT NULL AND ((INSTR(list_shcc, ',') != 0 AND INSTR(list_shcc, qtl.SHCC) != 0) OR (list_shcc = qtl.SHCC)))
      OR (list_dv IS NOT NULL AND INSTR(list_dv, cb.MA_DON_VI) != 0)
      OR (list_shcc IS NULL AND list_dv IS NULL))
      AND (timeType = 0 OR (
            timeType = 1 AND (qtl.BAT_DAU IS NOT NULL AND (fromYear IS NULL OR qtl.BAT_DAU >= fromYear)) AND (toYear IS NULL OR qtl.BAT_DAU <= toYear)
          ) OR (
            timeType = 2 AND (qtl.NGAY_HUONG IS NOT NULL AND (fromYear IS NULL OR qtl.NGAY_HUONG >= fromYear) AND (toYear IS NULL OR qtl.NGAY_HUONG <= toYear))
                ))
      AND (tinhTrang IS NULL OR ((qtl.KET_THUC = -1 OR qtl.KET_THUC >= today) AND tinhTrang = 2) OR
        (qtl.KET_THUC IS NOT NULL AND qtl.KET_THUC != -1 AND qtl.KET_THUC < today AND tinhTrang = 1))))
        AND (searchTerm = ''
        OR LOWER(cb.SHCC) LIKE sT
        OR LOWER(TRIM(cb.HO || ' ' || cb.TEN)) LIKE sT
        OR LOWER(qtl.CHUC_DANH_NGHE_NGHIEP) LIKE sT
        OR LOWER(qtl.SO_HIEU_VAN_BAN) LIKE sT);

    IF pageNumber < 1 THEN pageNumber := 1; END IF;
    IF pageSize < 1 THEN pageSize := 1; END IF;
    pageTotal := CEIL(totalItem / pageSize);
    pageNumber := LEAST(pageNumber, pageTotal);

    OPEN my_cursor FOR
        SELECT *
        FROM (
                 SELECT qtl.SHCC    as "shcc",
                        qtl.ID                              AS  "id",
                        cb.HO                               AS  "ho",
                        cb.TEN                              AS  "ten",
                        qtl.BAT_DAU                         AS  "batDau",
                        qtl.BAT_DAU_TYPE                    as  "batDauType",
                        qtl.KET_THUC                        as  "ketThuc",
                        qtl.KET_THUC_TYPE                   as  "ketThucType",
                        qtl.CHUC_DANH_NGHE_NGHIEP           as  "chucDanhNgheNghiep",
                        qtl.BAC                             as  "bac",
                        qtl.HE_SO_LUONG                     as  "heSoLuong",
                        qtl.PHU_CAP_THAM_NIEN_VUOT_KHUNG    as  "phuCapThamNienVuotKhung",
                        qtl.NGAY_HUONG                      as  "ngayHuong",
                        qtl.MOC_NANG_BAC_LUONG              as  "mocNangBacLuong",
                        qtl.SO_HIEU_VAN_BAN                 as  "soHieuVanBan",

                        today   AS "today",

                        dv.MA              AS                       "maDonVi",
                        dv.TEN             AS                       "tenDonVi",

                        ROW_NUMBER() OVER (ORDER BY qtl.NGAY_HUONG DESC) R
                 FROM QT_LUONG qtl
                          LEFT JOIN TCHC_CAN_BO cb on qtl.SHCC = cb.SHCC
                          LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
                WHERE (((list_shcc IS NULL) AND (list_dv IS NULL) AND (fromYear IS NULL) AND (toYear IS NULL) AND (timeType = 0) AND (tinhTrang IS NULL))
                    OR (((list_shcc IS NOT NULL AND ((INSTR(list_shcc, ',') != 0 AND INSTR(list_shcc, qtl.SHCC) != 0) OR (list_shcc = qtl.SHCC)))
                  OR (list_dv IS NOT NULL AND INSTR(list_dv, cb.MA_DON_VI) != 0)
                  OR (list_shcc IS NULL AND list_dv IS NULL))
                  AND (timeType = 0 OR (
                        timeType = 1 AND (qtl.BAT_DAU IS NOT NULL AND (fromYear IS NULL OR qtl.BAT_DAU >= fromYear)) AND (toYear IS NULL OR qtl.BAT_DAU <= toYear)
                      ) OR (
                        timeType = 2 AND (qtl.NGAY_HUONG IS NOT NULL AND (fromYear IS NULL OR qtl.NGAY_HUONG >= fromYear) AND (toYear IS NULL OR qtl.NGAY_HUONG <= toYear))
                            ))
                  AND (tinhTrang IS NULL OR ((qtl.KET_THUC = -1 OR qtl.KET_THUC >= today) AND tinhTrang = 2) OR
                    (qtl.KET_THUC IS NOT NULL AND qtl.KET_THUC != -1 AND qtl.KET_THUC < today AND tinhTrang = 1))))
                    AND (searchTerm = ''
                    OR LOWER(cb.SHCC) LIKE sT
                    OR LOWER(TRIM(cb.HO || ' ' || cb.TEN)) LIKE sT
                    OR LOWER(qtl.CHUC_DANH_NGHE_NGHIEP) LIKE sT
                    OR LOWER(qtl.SO_HIEU_VAN_BAN) LIKE sT)
                ORDER BY qtl.NGAY_HUONG DESC
             )
        WHERE R BETWEEN (pageNumber - 1) * pageSize + 1 AND pageNumber * pageSize;
    RETURN my_cursor;

END;

/
--EndMethod--

CREATE OR REPLACE FUNCTION QT_NCKH_DOWNLOAD_EXCEL(filter IN STRING) RETURN SYS_REFCURSOR
AS
    my_cursor   SYS_REFCURSOR;
    FROMTIME    NUMBER(20)  := SUBSTR(filter, INSTR(filter, '%', 1, 1) + 1,
                                      INSTR(filter, '%', 1, 2) - INSTR(filter, '%', 1, 1) - 1);
    TOTIME      NUMBER(20)  := SUBSTR(filter, INSTR(filter, '%', 1, 2) + 1,
                                      INSTR(filter, '%', 1, 3) - INSTR(filter, '%', 1, 2) - 1);
    LOAI_HOC_VI STRING(15)  := SUBSTR(filter, INSTR(filter, '%', 1, 3) + 1,
                                      INSTR(filter, '%', 1, 4) - INSTR(filter, '%', 1, 3) - 1);
    DON_VI      STRING(200)  := SUBSTR(filter, INSTR(filter, '%', 1, 4) + 1,
                                      INSTR(filter, '%', 1, 5) - INSTR(filter, '%', 1, 4) - 1);
    MASOCB      STRING(200)  := SUBSTR(filter, INSTR(filter, '%', 1, 5) + 1,
                                      INSTR(filter, '%', 1, 6) - INSTR(filter, '%', 1, 5) - 1);
BEGIN
    OPEN my_cursor FOR
        SELECT *
        FROM (
                 SELECT qtnckh.ID                                                      AS "id",
                        qtnckh.TEN_DE_TAI                                              AS "tenDeTai",
                        qtnckh.MA_SO_CAP_QUAN_LY                                       AS "maSoCapQuanLy",
                        qtnckh.KINH_PHI                                                AS "kinhPhi",
                        qtnckh.BAT_DAU                                                 AS "batDau",
                        qtnckh.BAT_DAU_TYPE                                            AS "batDauType",
                        qtnckh.KET_THUC                                                AS "ketThuc",
                        qtnckh.KET_THUC_TYPE                                           AS "ketThucType",
                        qtnckh.NGAY_NGHIEM_THU                                         AS "ngayNghiemThu",
                        qtnckh.NGAY_NGHIEM_THU_TYPE                                    AS "ngayNghiemThuType",
                        qtnckh.VAI_TRO                                                 AS "vaiTro",
                        qtnckh.KET_QUA                                                 AS "ketQua",
                        qtnckh.THOI_GIAN                                               AS "thoiGian",
                        qtnckh.SHCC                                                    AS "shcc",

                        CB.HO                                                          AS "hoCanBo",
                        CB.TEN                                                         AS "tenCanBo",
                        (select TEN FROM DM_TRINH_DO WHERE CB.HOC_VI = DM_TRINH_DO.MA) AS "hocViCanBo",

                        ROW_NUMBER() OVER (ORDER BY ID DESC)                              R
                 FROM QT_NGHIEN_CUU_KHOA_HOC qtnckh
                          LEFT JOIN TCHC_CAN_BO CB on qtnckh.SHCC = CB.SHCC
                 WHERE (filter = '%%%%%%%'
                     OR (
                                ((TO_CHAR(qtnckh.SHCC) IN (select regexp_substr(QT_NCKH_DOWNLOAD_EXCEL.MASOCB, '[^,]+', 1, level)
                                              from dual
                                              connect by
                                                      regexp_substr(QT_NCKH_DOWNLOAD_EXCEL.MASOCB, '[^,]+', 1, level) is not null))
                                    OR QT_NCKH_DOWNLOAD_EXCEL.MASOCB IS NULL)
                                AND
                                ((CB.MA_DON_VI IN (select regexp_substr(QT_NCKH_DOWNLOAD_EXCEL.DON_VI, '[^,]+', 1, level)
                                                   from dual
                                                   connect by
                                                           regexp_substr(QT_NCKH_DOWNLOAD_EXCEL.DON_VI, '[^,]+', 1, level) is not null))
                                    OR QT_NCKH_DOWNLOAD_EXCEL.DON_VI IS NULL)
                                AND
                                ((CB.HOC_VI IN (select regexp_substr(QT_NCKH_DOWNLOAD_EXCEL.LOAI_HOC_VI, '[^,]+', 1, level)
                                                from dual
                                                connect by
                                                        regexp_substr(QT_NCKH_DOWNLOAD_EXCEL.LOAI_HOC_VI, '[^,]+', 1, level) is not null))
                                    OR QT_NCKH_DOWNLOAD_EXCEL.LOAI_HOC_VI IS NULL)
                                AND ((qtnckh.NGAY_NGHIEM_THU IS NOT NULL
                                AND (
                                              (QT_NCKH_DOWNLOAD_EXCEL.FROMTIME IS NULL
                                                  OR (QT_NCKH_DOWNLOAD_EXCEL.FROMTIME <= qtnckh.NGAY_NGHIEM_THU))
                                              AND
                                              (QT_NCKH_DOWNLOAD_EXCEL.TOTIME IS NULL
                                                  OR (QT_NCKH_DOWNLOAD_EXCEL.TOTIME >= qtnckh.NGAY_NGHIEM_THU))
                                          )
                                )
                                    )
                            )
                     )
                 ORDER BY qtnckh.NGAY_NGHIEM_THU DESC
             );
    RETURN my_cursor;
END;

/
--EndMethod--

CREATE OR REPLACE FUNCTION QT_NCKH_GROUP_PAGE(pageNumber IN OUT NUMBER, pageSize IN OUT NUMBER, searchTerm IN STRING,
                                   totalItem OUT NUMBER, pageTotal OUT NUMBER, mscb IN STRING,
                                   filter IN STRING) RETURN SYS_REFCURSOR
AS
    my_cursor   SYS_REFCURSOR;
    sT          STRING(500) := '%' || lower(searchTerm) || '%';
    FROMTIME    NUMBER(20)  := SUBSTR(filter, INSTR(filter, '%', 1, 1) + 1,
                                      INSTR(filter, '%', 1, 2) - INSTR(filter, '%', 1, 1) - 1);
    TOTIME      NUMBER(20)  := SUBSTR(filter, INSTR(filter, '%', 1, 2) + 1,
                                      INSTR(filter, '%', 1, 3) - INSTR(filter, '%', 1, 2) - 1);
    LOAI_HOC_VI STRING(100) := SUBSTR(filter, INSTR(filter, '%', 1, 3) + 1,
                                      INSTR(filter, '%', 1, 4) - INSTR(filter, '%', 1, 3) - 1);
    DON_VI      STRING(100) := SUBSTR(filter, INSTR(filter, '%', 1, 4) + 1,
                                      INSTR(filter, '%', 1, 5) - INSTR(filter, '%', 1, 4) - 1);
    MASOCB      STRING(200) := SUBSTR(filter, INSTR(filter, '%', 1, 5) + 1,
                                      INSTR(filter, '%', 1, 6) - INSTR(filter, '%', 1, 5) - 1);
BEGIN
    SELECT COUNT(*)
    INTO totalItem

    FROM (SELECT *
          FROM QT_NGHIEN_CUU_KHOA_HOC
          WHERE ID IN
                (SELECT MAX(ID) FROM (SELECT * FROM QT_NGHIEN_CUU_KHOA_HOC ORDER BY SHCC DESC) GROUP BY SHCC)) qtnckh
             LEFT JOIN TCHC_CAN_BO cb on qtnckh.SHCC = cb.SHCC
             LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
    WHERE (mscb IS NULL OR mscb = CB.SHCC)
      AND (filter = '%%%%%%%'
        OR (
                   ((TO_CHAR(qtnckh.SHCC) IN (select regexp_substr(QT_NCKH_GROUP_PAGE.MASOCB, '[^,]+', 1, level)
                                              from dual
                                              connect by
                                                      regexp_substr(QT_NCKH_GROUP_PAGE.MASOCB, '[^,]+', 1, level) is not null))
                       OR QT_NCKH_GROUP_PAGE.MASOCB IS NULL)
                   AND
                   ((CB.MA_DON_VI IN (select regexp_substr(QT_NCKH_GROUP_PAGE.DON_VI, '[^,]+', 1, level)
                                      from dual
                                      connect by
                                              regexp_substr(QT_NCKH_GROUP_PAGE.DON_VI, '[^,]+', 1, level) is not null))
                       OR QT_NCKH_GROUP_PAGE.DON_VI IS NULL)
                   AND ((CB.HOC_VI IN (select regexp_substr(QT_NCKH_GROUP_PAGE.LOAI_HOC_VI, '[^,]+', 1, level)
                                       from dual
                                       connect by
                                               regexp_substr(QT_NCKH_GROUP_PAGE.LOAI_HOC_VI, '[^,]+', 1, level) is not null))
                   OR QT_NCKH_GROUP_PAGE.LOAI_HOC_VI IS NULL)
                   AND ((qtnckh.NGAY_NGHIEM_THU IS NOT NULL
                   AND (
                                 (QT_NCKH_GROUP_PAGE.FROMTIME IS NULL
                                     OR (QT_NCKH_GROUP_PAGE.FROMTIME <= qtnckh.NGAY_NGHIEM_THU))
                                 AND
                                 (QT_NCKH_GROUP_PAGE.TOTIME IS NULL
                                     OR (QT_NCKH_GROUP_PAGE.TOTIME >= qtnckh.NGAY_NGHIEM_THU))
                             )
                   )
                       )
               )
        )
      AND (searchTerm = ''
        OR LOWER(CB.SHCC) LIKE sT
        OR LOWER(TRIM(CB.HO || ' ' || CB.TEN)) LIKE sT
        OR LOWER(TRIM(qtnckh.TEN_DE_TAI)) LIKE sT
        OR LOWER(TRIM(qtnckh.VAI_TRO)) LIKE sT
        OR LOWER(TRIM(qtnckh.MA_SO_CAP_QUAN_LY)) LIKE sT);

    IF pageNumber < 1 THEN pageNumber := 1; END IF;
    IF pageSize < 1 THEN pageSize := 1; END IF;
    pageTotal := CEIL(totalItem / pageSize);
    pageNumber := LEAST(pageNumber, pageTotal);

    OPEN my_cursor FOR
        SELECT *
        FROM (
                 SELECT qtnckh.SHCC                                                                  AS "shcc",
                        cb.HO                                                                        AS "hoCanBo",
                        cb.TEN                                                                       AS "tenCanBo",
                        (select TEN FROM DM_TRINH_DO WHERE cb.HOC_VI = DM_TRINH_DO.MA)               AS "hocViCanBo",
                        (SELECT COUNT(*) FROM QT_NGHIEN_CUU_KHOA_HOC nc WHERE nc.SHCC = qtnckh.SHCC) AS "soDeTai",
                        (Select listagg(TG.TEN_DE_TAI, '??') within group ( order by null)
                         from QT_NGHIEN_CUU_KHOA_HOC TG
                         where TG.SHCC = qtnckh.SHCC)                                                AS "danhSachDeTai",
                        ROW_NUMBER() OVER (ORDER BY ID DESC)                                            R
                 FROM (SELECT *
                       FROM QT_NGHIEN_CUU_KHOA_HOC
                       WHERE ID IN (SELECT MAX(ID)
                                    FROM (SELECT * FROM QT_NGHIEN_CUU_KHOA_HOC ORDER BY SHCC DESC)
                                    GROUP BY SHCC)) qtnckh
                          LEFT JOIN TCHC_CAN_BO cb on qtnckh.SHCC = cb.SHCC
                          LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
                 WHERE (mscb IS NULL OR mscb = CB.SHCC)
                   AND (filter = '%%%%%%%'
                     OR (
                                ((TO_CHAR(qtnckh.SHCC) IN
                                  (select regexp_substr(QT_NCKH_GROUP_PAGE.MASOCB, '[^,]+', 1, level)
                                   from dual
                                   connect by regexp_substr(QT_NCKH_GROUP_PAGE.MASOCB, '[^,]+', 1, level) is not null))
                                    OR QT_NCKH_GROUP_PAGE.MASOCB IS NULL)
                                AND
                                ((CB.MA_DON_VI IN (select regexp_substr(QT_NCKH_GROUP_PAGE.DON_VI, '[^,]+', 1, level)
                                                   from dual
                                                   connect by
                                                           regexp_substr(QT_NCKH_GROUP_PAGE.DON_VI, '[^,]+', 1, level) is not null))
                                    OR QT_NCKH_GROUP_PAGE.DON_VI IS NULL)
                                AND
                                ((CB.HOC_VI IN (select regexp_substr(QT_NCKH_GROUP_PAGE.LOAI_HOC_VI, '[^,]+', 1, level)
                                                from dual
                                                connect by
                                                        regexp_substr(QT_NCKH_GROUP_PAGE.LOAI_HOC_VI, '[^,]+', 1, level) is not null))
                                    OR QT_NCKH_GROUP_PAGE.LOAI_HOC_VI IS NULL)
                                AND ((qtnckh.NGAY_NGHIEM_THU IS NOT NULL
                                AND (
                                              (QT_NCKH_GROUP_PAGE.FROMTIME IS NULL
                                                  OR (QT_NCKH_GROUP_PAGE.FROMTIME <= qtnckh.NGAY_NGHIEM_THU))
                                              AND
                                              (QT_NCKH_GROUP_PAGE.TOTIME IS NULL
                                                  OR (QT_NCKH_GROUP_PAGE.TOTIME >= qtnckh.NGAY_NGHIEM_THU))
                                          )
                                )
                                    )
                            )
                     )
                   AND (searchTerm = ''
                     OR LOWER(CB.SHCC) LIKE sT
                     OR LOWER(TRIM(CB.HO || ' ' || CB.TEN)) LIKE sT
                     OR LOWER(TRIM(qtnckh.TEN_DE_TAI)) LIKE sT
                     OR LOWER(TRIM(qtnckh.VAI_TRO)) LIKE sT
                     OR LOWER(TRIM(qtnckh.MA_SO_CAP_QUAN_LY)) LIKE sT)
                 ORDER BY qtnckh.NGAY_NGHIEM_THU DESC
             )
        WHERE R BETWEEN (pageNumber - 1) * pageSize + 1 AND pageNumber * pageSize;
    RETURN my_cursor;

END;

/
--EndMethod--

CREATE OR REPLACE FUNCTION QT_NCKH_SEARCH_PAGE(pageNumber IN OUT NUMBER, pageSize IN OUT NUMBER, searchTerm IN STRING,
                                    totalItem OUT NUMBER, pageTotal OUT NUMBER, mscb IN STRING,
                                    filter IN STRING) RETURN SYS_REFCURSOR
AS
    my_cursor   SYS_REFCURSOR;
    sT          STRING(500) := '%' || lower(searchTerm) || '%';
    FROMTIME    NUMBER(20)  := SUBSTR(filter, INSTR(filter, '%', 1, 1) + 1,
                                      INSTR(filter, '%', 1, 2) - INSTR(filter, '%', 1, 1) - 1);
    TOTIME      NUMBER(20)  := SUBSTR(filter, INSTR(filter, '%', 1, 2) + 1,
                                      INSTR(filter, '%', 1, 3) - INSTR(filter, '%', 1, 2) - 1);
    LOAI_HOC_VI STRING(15)  := SUBSTR(filter, INSTR(filter, '%', 1, 3) + 1,
                                      INSTR(filter, '%', 1, 4) - INSTR(filter, '%', 1, 3) - 1);
    DON_VI      STRING(200) := SUBSTR(filter, INSTR(filter, '%', 1, 4) + 1,
                                      INSTR(filter, '%', 1, 5) - INSTR(filter, '%', 1, 4) - 1);
    MASOCB      STRING(200) := SUBSTR(filter, INSTR(filter, '%', 1, 5) + 1,
                                      INSTR(filter, '%', 1, 6) - INSTR(filter, '%', 1, 5) - 1);
BEGIN
    SELECT COUNT(*)
    INTO totalItem

    FROM QT_NGHIEN_CUU_KHOA_HOC qtnckh
             LEFT JOIN TCHC_CAN_BO CB on qtnckh.SHCC = CB.SHCC
    WHERE (mscb IS NULL OR mscb = CB.SHCC)
      AND (filter = '%%%%%%%'
        OR (
                   ((TO_CHAR(qtnckh.SHCC) IN (select regexp_substr(QT_NCKH_SEARCH_PAGE.MASOCB, '[^,]+', 1, level)
                                              from dual
                                              connect by
                                                      regexp_substr(QT_NCKH_SEARCH_PAGE.MASOCB, '[^,]+', 1, level) is not null))
                       OR QT_NCKH_SEARCH_PAGE.MASOCB IS NULL)
                   AND
                   ((CB.MA_DON_VI IN (select regexp_substr(QT_NCKH_SEARCH_PAGE.DON_VI, '[^,]+', 1, level)
                                      from dual
                                      connect by
                                              regexp_substr(QT_NCKH_SEARCH_PAGE.DON_VI, '[^,]+', 1, level) is not null))
                       OR QT_NCKH_SEARCH_PAGE.DON_VI IS NULL)
                   AND ((CB.HOC_VI IN (select regexp_substr(QT_NCKH_SEARCH_PAGE.LOAI_HOC_VI, '[^,]+', 1, level)
                                       from dual
                                       connect by
                                               regexp_substr(QT_NCKH_SEARCH_PAGE.LOAI_HOC_VI, '[^,]+', 1, level) is not null))
                   OR QT_NCKH_SEARCH_PAGE.LOAI_HOC_VI IS NULL)
                   AND ((qtnckh.NGAY_NGHIEM_THU IS NOT NULL
                   AND (
                                 (QT_NCKH_SEARCH_PAGE.FROMTIME IS NULL
                                     OR (QT_NCKH_SEARCH_PAGE.FROMTIME <= qtnckh.NGAY_NGHIEM_THU))
                                 AND
                                 (QT_NCKH_SEARCH_PAGE.TOTIME IS NULL
                                     OR (QT_NCKH_SEARCH_PAGE.TOTIME >= qtnckh.NGAY_NGHIEM_THU))
                             )
                   )
                       )
               )
        )
      AND (searchTerm = ''
        OR LOWER(CB.SHCC) LIKE sT
        OR LOWER(TRIM(CB.HO || ' ' || CB.TEN)) LIKE sT
        OR LOWER(TRIM(qtnckh.TEN_DE_TAI)) LIKE sT
        OR LOWER(TRIM(qtnckh.VAI_TRO)) LIKE sT
        OR LOWER(TRIM(qtnckh.KET_QUA)) LIKE sT
        OR LOWER(TRIM(qtnckh.MA_SO_CAP_QUAN_LY)) LIKE sT);

    IF pageNumber < 1 THEN pageNumber := 1; END IF;
    IF pageSize < 1 THEN pageSize := 1; END IF;
    pageTotal := CEIL(totalItem / pageSize);
    pageNumber := LEAST(pageNumber, pageTotal);

    OPEN my_cursor FOR
        SELECT *
        FROM (
                 SELECT qtnckh.ID                                                      AS "id",
                        qtnckh.TEN_DE_TAI                                              AS "tenDeTai",
                        qtnckh.MA_SO_CAP_QUAN_LY                                       AS "maSoCapQuanLy",
                        qtnckh.KINH_PHI                                                AS "kinhPhi",
                        qtnckh.BAT_DAU                                                 AS "batDau",
                        qtnckh.BAT_DAU_TYPE                                            AS "batDauType",
                        qtnckh.KET_THUC                                                AS "ketThuc",
                        qtnckh.KET_THUC_TYPE                                           AS "ketThucType",
                        qtnckh.NGAY_NGHIEM_THU                                         AS "ngayNghiemThu",
                        qtnckh.NGAY_NGHIEM_THU_TYPE                                    AS "ngayNghiemThuType",
                        qtnckh.VAI_TRO                                                 AS "vaiTro",
                        qtnckh.KET_QUA                                                 AS "ketQua",
                        qtnckh.THOI_GIAN                                               AS "thoiGian",
                        qtnckh.SHCC                                                    AS "shcc",

                        CB.HO                                                          AS "hoCanBo",
                        CB.TEN                                                         AS "tenCanBo",
                        (select TEN FROM DM_TRINH_DO WHERE CB.HOC_VI = DM_TRINH_DO.MA) AS "hocViCanBo",

                        ROW_NUMBER() OVER (ORDER BY ID DESC)                              R
                 FROM QT_NGHIEN_CUU_KHOA_HOC qtnckh
                          LEFT JOIN TCHC_CAN_BO CB on qtnckh.SHCC = CB.SHCC
                 WHERE (mscb IS NULL OR mscb = CB.SHCC)
                   AND (filter = '%%%%%%%'
                     OR (
                                ((TO_CHAR(qtnckh.SHCC) IN
                                  (select regexp_substr(QT_NCKH_SEARCH_PAGE.MASOCB, '[^,]+', 1, level)
                                   from dual
                                   connect by regexp_substr(QT_NCKH_SEARCH_PAGE.MASOCB, '[^,]+', 1, level) is not null))
                                    OR QT_NCKH_SEARCH_PAGE.MASOCB IS NULL)
                                AND
                                ((CB.MA_DON_VI IN (select regexp_substr(QT_NCKH_SEARCH_PAGE.DON_VI, '[^,]+', 1, level)
                                                   from dual
                                                   connect by
                                                           regexp_substr(QT_NCKH_SEARCH_PAGE.DON_VI, '[^,]+', 1, level) is not null))
                                    OR QT_NCKH_SEARCH_PAGE.DON_VI IS NULL)
                                AND
                                ((CB.HOC_VI IN (select regexp_substr(QT_NCKH_SEARCH_PAGE.LOAI_HOC_VI, '[^,]+', 1, level)
                                                from dual
                                                connect by
                                                        regexp_substr(QT_NCKH_SEARCH_PAGE.LOAI_HOC_VI, '[^,]+', 1, level) is not null))
                                    OR QT_NCKH_SEARCH_PAGE.LOAI_HOC_VI IS NULL)
                                AND ((qtnckh.NGAY_NGHIEM_THU IS NOT NULL
                                AND (
                                              (QT_NCKH_SEARCH_PAGE.FROMTIME IS NULL
                                                  OR (QT_NCKH_SEARCH_PAGE.FROMTIME <= qtnckh.NGAY_NGHIEM_THU))
                                              AND
                                              (QT_NCKH_SEARCH_PAGE.TOTIME IS NULL
                                                  OR (QT_NCKH_SEARCH_PAGE.TOTIME >= qtnckh.NGAY_NGHIEM_THU))
                                          )
                                )
                                    )
                            )
                     )
                   AND (searchTerm = ''
                     OR LOWER(CB.SHCC) LIKE sT
                     OR LOWER(TRIM(CB.HO || ' ' || CB.TEN)) LIKE sT
                     OR LOWER(TRIM(qtnckh.TEN_DE_TAI)) LIKE sT
                     OR LOWER(TRIM(qtnckh.VAI_TRO)) LIKE sT
                     OR LOWER(TRIM(qtnckh.KET_QUA)) LIKE sT
                     OR LOWER(TRIM(qtnckh.MA_SO_CAP_QUAN_LY)) LIKE sT)
                 ORDER BY qtnckh.NGAY_NGHIEM_THU DESC
             )
        WHERE R BETWEEN (pageNumber - 1) * pageSize + 1 AND pageNumber * pageSize;
    RETURN my_cursor;

END;

/
--EndMethod--

CREATE OR REPLACE FUNCTION QT_NGHIEN_CUU_KHOA_HOC_DOWNLOAD_EXCEL(maSoCanBo IN STRING, loaiHocVi IN STRING,
                                                   fromYear IN NUMBER, toYear IN NUMBER, timeType IN NUMBER,
                                                   maDonVi IN STRING) RETURN SYS_REFCURSOR
AS
    my_cursor   SYS_REFCURSOR;
BEGIN
    OPEN my_cursor FOR
        SELECT *
        FROM (
                 SELECT qtnckh.ID                                                      AS "id",
                        qtnckh.TEN_DE_TAI                                              AS "tenDeTai",
                        qtnckh.MA_SO_CAP_QUAN_LY                                       AS "maSoCapQuanLy",
                        qtnckh.KINH_PHI                                                AS "kinhPhi",
                        qtnckh.BAT_DAU                                                 AS "batDau",
                        qtnckh.BAT_DAU_TYPE                                            AS "batDauType",
                        qtnckh.KET_THUC                                                AS "ketThuc",
                        qtnckh.KET_THUC_TYPE                                           AS "ketThucType",
                        qtnckh.NGAY_NGHIEM_THU                                         AS "ngayNghiemThu",
                        qtnckh.NGAY_NGHIEM_THU_TYPE                                    AS "ngayNghiemThuType",
                        qtnckh.VAI_TRO                                                 AS "vaiTro",
                        qtnckh.KET_QUA                                                 AS "ketQua",
                        qtnckh.THOI_GIAN                                               AS "thoiGian",
                        qtnckh.SHCC                                                    AS "shcc",

                        CB.HO                                                          AS "hoCanBo",
                        CB.TEN                                                         AS "tenCanBo",
                        qtnckh.IN_LLKH                                                  AS "inLLKH",
                        (select TEN FROM DM_TRINH_DO WHERE CB.HOC_VI = DM_TRINH_DO.MA) AS "hocViCanBo",

                        ROW_NUMBER() OVER (ORDER BY ID DESC)                              R
                 FROM QT_NGHIEN_CUU_KHOA_HOC qtnckh
                          LEFT JOIN TCHC_CAN_BO CB on qtnckh.SHCC = CB.SHCC
                WHERE ((maSoCanBo IS NOT NULL AND cb.SHCC IN (SELECT regexp_substr(maSoCanBo, '[^,]+', 1, level) from dual connect by regexp_substr(maSoCanBo, '[^,]+', 1, level) is not null))
                    OR (maDonVi IS NOT NULL AND cb.MA_DON_VI IN (SELECT regexp_substr(maDonVi, '[^,]+', 1, level) from dual connect by regexp_substr(maDonVi, '[^,]+', 1, level) is not null))
                    OR (loaiHocVi IS NOT NULL AND cb.HOC_VI IN (SELECT regexp_substr(loaiHocVi, '[^,]+', 1, level) from dual connect by regexp_substr(loaiHocVi, '[^,]+', 1, level) is not null))
                    OR (maSoCanBo IS NULL AND maDonVi IS NULL AND loaiHocVi IS NULL))
                  AND (timeType = 0 OR (timeType = 1 AND
                                        (qtnckh.BAT_DAU IS NOT NULL AND (fromYear IS NULL OR qtnckh.BAT_DAU >= fromYear))
                    AND (qtnckh.BAT_DAU IS NOT NULL AND (toYear IS NULL OR qtnckh.BAT_DAU <= toYear)))
                    OR ((timeType = 2) AND
                                        (qtnckh.KET_THUC IS NOT NULL AND (fromYear IS NULL OR qtnckh.KET_THUC >= fromYear))
                    AND (qtnckh.KET_THUC IS NOT NULL AND (toYear IS NULL OR qtnckh.KET_THUC <= toYear)))
                    OR ((timeType = 3) AND
                                        (qtnckh.NGAY_NGHIEM_THU IS NOT NULL AND (fromYear IS NULL OR qtnckh.NGAY_NGHIEM_THU >= fromYear))
                    AND (qtnckh.NGAY_NGHIEM_THU IS NOT NULL AND (toYear IS NULL OR qtnckh.NGAY_NGHIEM_THU <= toYear))))
                 ORDER BY qtnckh.BAT_DAU DESC NULLS LAST
             );
    RETURN my_cursor;
END;

/
--EndMethod--

CREATE OR REPLACE FUNCTION QT_NGHIEN_CUU_KHOA_HOC_GROUP_PAGE(pageNumber IN OUT NUMBER, pageSize IN OUT NUMBER,
                                                  searchTerm IN STRING,
                                                  maSoCanBo IN STRING, loaiHocVi IN STRING,
                                                  fromYear IN NUMBER, toYear IN NUMBER, timeType IN NUMBER,
                                                  maDonVi IN STRING,
                                                  totalItem OUT NUMBER, pageTotal OUT NUMBER) RETURN SYS_REFCURSOR
AS
    my_cursor SYS_REFCURSOR;
    sT        STRING(500) := '%' || lower(searchTerm) || '%';
BEGIN
    SELECT COUNT(*)
    INTO totalItem

    FROM (SELECT *
          FROM QT_NGHIEN_CUU_KHOA_HOC
          WHERE ID IN
                (SELECT MAX(ID) FROM (SELECT * FROM QT_NGHIEN_CUU_KHOA_HOC ORDER BY SHCC DESC) GROUP BY SHCC)) qtnckh
             LEFT JOIN TCHC_CAN_BO cb on qtnckh.SHCC = cb.SHCC
             LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
             LEFT JOIN DM_TRINH_DO td ON (cb.HOC_VI = td.MA)
             LEFT JOIN DM_NGACH_CDNN cdnn ON (cdnn.MA = cb.NGACH);
    IF pageNumber < 1 THEN pageNumber := 1; END IF;
    IF pageSize < 1 THEN pageSize := 1; END IF;
    pageTotal := CEIL(totalItem / pageSize);
    pageNumber := LEAST(pageNumber, pageTotal);

    OPEN my_cursor FOR
        SELECT *
        FROM (SELECT qtnckh.SHCC                                                    AS "shcc",
                     cb.HO                                                          AS "hoCanBo",
                     cb.TEN                                                         AS "tenCanBo",
                     (select TEN FROM DM_TRINH_DO WHERE cb.HOC_VI = DM_TRINH_DO.MA) AS "hocViCanBo",
                     (SELECT COUNT(*)
                      FROM QT_NGHIEN_CUU_KHOA_HOC qtnckh_tmp
                               LEFT JOIN TCHC_CAN_BO CB on qtnckh_tmp.SHCC = CB.SHCC
                      WHERE (qtnckh_tmp.SHCC = qtnckh.SHCC)
                        AND ((maSoCanBo IS NOT NULL AND cb.SHCC IN (SELECT regexp_substr(maSoCanBo, '[^,]+', 1, level)
                                                                    from dual
                                                                    connect by regexp_substr(maSoCanBo, '[^,]+', 1, level) is not null))
                          OR (maDonVi IS NOT NULL AND cb.MA_DON_VI IN (SELECT regexp_substr(maDonVi, '[^,]+', 1, level)
                                                                       from dual
                                                                       connect by regexp_substr(maDonVi, '[^,]+', 1, level) is not null))
                          OR (loaiHocVi IS NOT NULL AND cb.HOC_VI IN (SELECT regexp_substr(loaiHocVi, '[^,]+', 1, level)
                                                                      from dual
                                                                      connect by regexp_substr(loaiHocVi, '[^,]+', 1, level) is not null))
                          OR (maSoCanBo IS NULL AND maDonVi IS NULL AND loaiHocVi IS NULL))
                        AND (timeType = 0 OR (timeType = 1 AND
                                              (qtnckh_tmp.BAT_DAU IS NOT NULL AND
                                               (fromYear IS NULL OR qtnckh_tmp.BAT_DAU >= fromYear))
                          AND (qtnckh_tmp.BAT_DAU IS NOT NULL AND (toYear IS NULL OR qtnckh_tmp.BAT_DAU <= toYear)))
                          OR ((timeType = 2) AND
                              (qtnckh_tmp.KET_THUC IS NOT NULL AND
                               (fromYear IS NULL OR qtnckh_tmp.KET_THUC >= fromYear))
                              AND
                              (qtnckh_tmp.KET_THUC IS NOT NULL AND (toYear IS NULL OR qtnckh_tmp.KET_THUC <= toYear)))
                          OR ((timeType = 3) AND
                              (qtnckh_tmp.NGAY_NGHIEM_THU IS NOT NULL AND
                               (fromYear IS NULL OR qtnckh_tmp.NGAY_NGHIEM_THU >= fromYear))
                              AND (qtnckh_tmp.NGAY_NGHIEM_THU IS NOT NULL AND
                                   (toYear IS NULL OR qtnckh_tmp.NGAY_NGHIEM_THU <= toYear)))
                          )
                        AND (searchTerm = ''
                          OR LOWER(CB.SHCC) LIKE sT
                          OR LOWER(TRIM(CB.HO || ' ' || CB.TEN)) LIKE sT
                          OR LOWER(TRIM(qtnckh_tmp.TEN_DE_TAI)) LIKE sT
                          OR LOWER(TRIM(qtnckh_tmp.VAI_TRO)) LIKE sT
                          OR LOWER(TRIM(qtnckh_tmp.KET_QUA)) LIKE sT
                          OR LOWER(TRIM(qtnckh_tmp.MA_SO_CAP_QUAN_LY)) LIKE sT))    AS "soDeTai",

                     (select rtrim(xmlagg(xmlelement(e, qtnckh_tmp.TEN_DE_TAI ||
                                                        CASE
                                                            WHEN (qtnckh_tmp.BAT_DAU IS NOT NULL)
                                                                THEN ' (' || to_char(
                                                                            qtnckh_tmp.BAT_DAU / (1000 * 60 * 60 * 24) +
                                                                            + TO_DATE('1970-01-01 08:00:00', 'YYYY-MM-DD HH:MI:SS'),
                                                                            qtnckh_tmp.BAT_DAU_TYPE) || ') '
                                                            ELSE ' ' END, '??').extract('//text()') order by
                                          null).getclobval(), '??')
                      FROM QT_NGHIEN_CUU_KHOA_HOC qtnckh_tmp
                               LEFT JOIN TCHC_CAN_BO CB on qtnckh_tmp.SHCC = CB.SHCC
                      WHERE (qtnckh_tmp.SHCC = qtnckh.SHCC)
                        AND ((maSoCanBo IS NOT NULL AND cb.SHCC IN (SELECT regexp_substr(maSoCanBo, '[^,]+', 1, level)
                                                                    from dual
                                                                    connect by regexp_substr(maSoCanBo, '[^,]+', 1, level) is not null))
                          OR (maDonVi IS NOT NULL AND cb.MA_DON_VI IN (SELECT regexp_substr(maDonVi, '[^,]+', 1, level)
                                                                       from dual
                                                                       connect by regexp_substr(maDonVi, '[^,]+', 1, level) is not null))
                          OR (loaiHocVi IS NOT NULL AND cb.HOC_VI IN (SELECT regexp_substr(loaiHocVi, '[^,]+', 1, level)
                                                                      from dual
                                                                      connect by regexp_substr(loaiHocVi, '[^,]+', 1, level) is not null))
                          OR (maSoCanBo IS NULL AND maDonVi IS NULL AND loaiHocVi IS NULL))
                        AND (timeType = 0 OR (timeType = 1 AND
                                              (qtnckh_tmp.BAT_DAU IS NOT NULL AND
                                               (fromYear IS NULL OR qtnckh_tmp.BAT_DAU >= fromYear))
                          AND (qtnckh_tmp.BAT_DAU IS NOT NULL AND (toYear IS NULL OR qtnckh_tmp.BAT_DAU <= toYear)))
                          OR ((timeType = 2) AND
                              (qtnckh_tmp.KET_THUC IS NOT NULL AND
                               (fromYear IS NULL OR qtnckh_tmp.KET_THUC >= fromYear))
                              AND
                              (qtnckh_tmp.KET_THUC IS NOT NULL AND (toYear IS NULL OR qtnckh_tmp.KET_THUC <= toYear)))
                          OR ((timeType = 3) AND
                              (qtnckh_tmp.NGAY_NGHIEM_THU IS NOT NULL AND
                               (fromYear IS NULL OR qtnckh_tmp.NGAY_NGHIEM_THU >= fromYear))
                              AND (qtnckh_tmp.NGAY_NGHIEM_THU IS NOT NULL AND
                                   (toYear IS NULL OR qtnckh_tmp.NGAY_NGHIEM_THU <= toYear)))
                          )
                        AND (searchTerm = ''
                          OR LOWER(CB.SHCC) LIKE sT
                          OR LOWER(TRIM(CB.HO || ' ' || CB.TEN)) LIKE sT
                          OR LOWER(TRIM(qtnckh_tmp.TEN_DE_TAI)) LIKE sT
                          OR LOWER(TRIM(qtnckh_tmp.VAI_TRO)) LIKE sT
                          OR LOWER(TRIM(qtnckh_tmp.KET_QUA)) LIKE sT
                          OR LOWER(TRIM(qtnckh_tmp.MA_SO_CAP_QUAN_LY)) LIKE sT))    AS "danhSachDeTai",
                     dv.MA                                                          AS "maDonVi",
                     dv.TEN                                                         AS "tenDonVi",

                     (SELECT DMCV.TEN
                      FROM QT_CHUC_VU QTCV
                               LEFT JOIN DM_CHUC_VU DMCV ON DMCV.MA = QTCV.MA_CHUC_VU
                      WHERE QTCV.SHCC = CB.SHCC
                        AND CHUC_VU_CHINH = 1)                                      AS "tenChucVu",

                     (SELECT QTCV.MA_CHUC_VU
                      FROM QT_CHUC_VU QTCV
                      WHERE QTCV.SHCC = CB.SHCC
                        AND CHUC_VU_CHINH = 1)                                      AS "maChucVu",
                     td.MA                                                          AS "maHocVi",
                     td.TEN                                                         AS "tenHocVi",

                     cdnn.MA                                                        AS "maChucDanhNgheNghiep",
                     cdnn.TEN                                                       AS "tenChucDanhNgheNghiep",

                     ROW_NUMBER() OVER (ORDER BY qtnckh.BAT_DAU DESC)                  R
              FROM (SELECT *
                    FROM QT_NGHIEN_CUU_KHOA_HOC
                    WHERE ID IN
                          (SELECT MAX(ID)
                           FROM (SELECT * FROM QT_NGHIEN_CUU_KHOA_HOC ORDER BY SHCC DESC)
                           GROUP BY SHCC)) qtnckh
                       LEFT JOIN TCHC_CAN_BO cb on qtnckh.SHCC = cb.SHCC
                       LEFT JOIN TCHC_CAN_BO cb on qtnckh.SHCC = cb.SHCC
                       LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
                       LEFT JOIN DM_TRINH_DO td ON (cb.HOC_VI = td.MA)
                       LEFT JOIN DM_NGACH_CDNN cdnn ON (cdnn.MA = cb.NGACH)
              ORDER BY qtnckh.BAT_DAU DESC NULLS LAST)
        WHERE R BETWEEN (pageNumber - 1) * pageSize + 1 AND pageNumber * pageSize;
    RETURN my_cursor;

END;

/
--EndMethod--

CREATE OR REPLACE FUNCTION QT_NGHIEN_CUU_KHOA_HOC_SEARCH_PAGE(pageNumber IN OUT NUMBER, pageSize IN OUT NUMBER,
                                                   searchTerm IN STRING,
                                                   maSoCanBo IN STRING, loaiHocVi IN STRING,
                                                   fromYear IN NUMBER, toYear IN NUMBER, timeType IN NUMBER,
                                                   maDonVi IN STRING,
                                                   totalItem OUT NUMBER, pageTotal OUT NUMBER) RETURN SYS_REFCURSOR
AS
    my_cursor SYS_REFCURSOR;
    sT        STRING(500) := '%' || lower(searchTerm) || '%';
BEGIN
    SELECT COUNT(*)
    INTO totalItem

    FROM QT_NGHIEN_CUU_KHOA_HOC qtnckh
             LEFT JOIN TCHC_CAN_BO CB on qtnckh.SHCC = CB.SHCC
             LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
             LEFT JOIN DM_TRINH_DO td ON (cb.HOC_VI = td.MA)
             LEFT JOIN DM_NGACH_CDNN cdnn ON (cdnn.MA = cb.NGACH)
    WHERE ((maSoCanBo IS NOT NULL AND cb.SHCC IN (SELECT regexp_substr(maSoCanBo, '[^,]+', 1, level)
                                                  from dual
                                                  connect by regexp_substr(maSoCanBo, '[^,]+', 1, level) is not null))
        OR (maDonVi IS NOT NULL AND cb.MA_DON_VI IN (SELECT regexp_substr(maDonVi, '[^,]+', 1, level)
                                                     from dual
                                                     connect by regexp_substr(maDonVi, '[^,]+', 1, level) is not null))
        OR (loaiHocVi IS NOT NULL AND cb.HOC_VI IN (SELECT regexp_substr(loaiHocVi, '[^,]+', 1, level)
                                                    from dual
                                                    connect by regexp_substr(loaiHocVi, '[^,]+', 1, level) is not null))
        OR (maSoCanBo IS NULL AND maDonVi IS NULL AND loaiHocVi IS NULL))
      AND (timeType = 0 OR (timeType = 1 AND
                            (qtnckh.BAT_DAU IS NOT NULL AND (fromYear IS NULL OR qtnckh.BAT_DAU >= fromYear))
        AND (qtnckh.BAT_DAU IS NOT NULL AND (toYear IS NULL OR qtnckh.BAT_DAU <= toYear)))
        OR ((timeType = 2) AND
            (qtnckh.KET_THUC IS NOT NULL AND (fromYear IS NULL OR qtnckh.KET_THUC >= fromYear))
            AND (qtnckh.KET_THUC IS NOT NULL AND (toYear IS NULL OR qtnckh.KET_THUC <= toYear)))
        OR ((timeType = 3) AND
            (qtnckh.NGAY_NGHIEM_THU IS NOT NULL AND (fromYear IS NULL OR qtnckh.NGAY_NGHIEM_THU >= fromYear))
            AND (qtnckh.NGAY_NGHIEM_THU IS NOT NULL AND (toYear IS NULL OR qtnckh.NGAY_NGHIEM_THU <= toYear)))
        )
      AND (searchTerm = ''
        OR LOWER(CB.SHCC) LIKE sT
        OR LOWER(TRIM(CB.HO || ' ' || CB.TEN)) LIKE sT
        OR LOWER(TRIM(qtnckh.TEN_DE_TAI)) LIKE sT
        OR LOWER(TRIM(qtnckh.VAI_TRO)) LIKE sT
        OR LOWER(TRIM(qtnckh.KET_QUA)) LIKE sT
        OR LOWER(TRIM(qtnckh.MA_SO_CAP_QUAN_LY)) LIKE sT);

    IF pageNumber < 1 THEN pageNumber := 1; END IF;
    IF pageSize < 1 THEN pageSize := 1; END IF;
    pageTotal := CEIL(totalItem / pageSize);
    pageNumber := LEAST(pageNumber, pageTotal);

    OPEN my_cursor FOR
        SELECT *
        FROM (SELECT qtnckh.ID                   AS                   "id",
                     qtnckh.TEN_DE_TAI           AS                   "tenDeTai",
                     qtnckh.MA_SO_CAP_QUAN_LY    AS                   "maSoCapQuanLy",
                     qtnckh.KINH_PHI             AS                   "kinhPhi",
                     qtnckh.BAT_DAU              AS                   "batDau",
                     qtnckh.BAT_DAU_TYPE         AS                   "batDauType",
                     qtnckh.KET_THUC             AS                   "ketThuc",
                     qtnckh.KET_THUC_TYPE        AS                   "ketThucType",
                     qtnckh.NGAY_NGHIEM_THU      AS                   "ngayNghiemThu",
                     qtnckh.NGAY_NGHIEM_THU_TYPE AS                   "ngayNghiemThuType",
                     qtnckh.VAI_TRO              AS                   "vaiTro",
                     qtnckh.KET_QUA              AS                   "ketQua",
                     qtnckh.THOI_GIAN            AS                   "thoiGian",
                     qtnckh.SHCC                 AS                   "shcc",
                     qtnckh.MA_SO                AS                   "maSo",
                     qtnckh.CAP_QUAN_LY          AS                   "capQuanLy",
                     CB.HO                       AS                   "hoCanBo",
                     CB.TEN                      AS                   "tenCanBo",
                     qtnckh.IN_LLKH              AS                   "inLLKH",

                     dv.MA                       AS                   "maDonVi",
                     dv.TEN                      AS                   "tenDonVi",

                     (SELECT DMCV.TEN
                      FROM QT_CHUC_VU QTCV
                               LEFT JOIN DM_CHUC_VU DMCV ON DMCV.MA = QTCV.MA_CHUC_VU
                      WHERE QTCV.SHCC = CB.SHCC
                        AND CHUC_VU_CHINH = 1)   AS                   "tenChucVu",

                     (SELECT QTCV.MA_CHUC_VU
                      FROM QT_CHUC_VU QTCV
                      WHERE QTCV.SHCC = CB.SHCC
                        AND CHUC_VU_CHINH = 1)   AS                   "maChucVu",

                     td.MA                       AS                   "maHocVi",
                     td.TEN                      AS                   "tenHocVi",

                     cdnn.MA                     AS                   "maChucDanhNgheNghiep",
                     cdnn.TEN                    AS                   "tenChucDanhNgheNghiep",

                     ROW_NUMBER() OVER (ORDER BY qtnckh.BAT_DAU DESC) R
              FROM QT_NGHIEN_CUU_KHOA_HOC qtnckh
                       LEFT JOIN TCHC_CAN_BO CB on qtnckh.SHCC = CB.SHCC
                       LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
                       LEFT JOIN DM_TRINH_DO td ON (cb.HOC_VI = td.MA)
                       LEFT JOIN DM_NGACH_CDNN cdnn ON (cdnn.MA = cb.NGACH)
              WHERE ((maSoCanBo IS NOT NULL AND cb.SHCC IN (SELECT regexp_substr(maSoCanBo, '[^,]+', 1, level)
                                                            from dual
                                                            connect by regexp_substr(maSoCanBo, '[^,]+', 1, level) is not null))
                  OR (maDonVi IS NOT NULL AND cb.MA_DON_VI IN (SELECT regexp_substr(maDonVi, '[^,]+', 1, level)
                                                               from dual
                                                               connect by regexp_substr(maDonVi, '[^,]+', 1, level) is not null))
                  OR (loaiHocVi IS NOT NULL AND cb.HOC_VI IN (SELECT regexp_substr(loaiHocVi, '[^,]+', 1, level)
                                                              from dual
                                                              connect by regexp_substr(loaiHocVi, '[^,]+', 1, level) is not null))
                  OR (maSoCanBo IS NULL AND maDonVi IS NULL AND loaiHocVi IS NULL))
                AND (timeType = 0 OR (timeType = 1 AND
                                      (qtnckh.BAT_DAU IS NOT NULL AND (fromYear IS NULL OR qtnckh.BAT_DAU >= fromYear))
                  AND (qtnckh.BAT_DAU IS NOT NULL AND (toYear IS NULL OR qtnckh.BAT_DAU <= toYear)))
                  OR ((timeType = 2) AND
                      (qtnckh.KET_THUC IS NOT NULL AND (fromYear IS NULL OR qtnckh.KET_THUC >= fromYear))
                      AND (qtnckh.KET_THUC IS NOT NULL AND (toYear IS NULL OR qtnckh.KET_THUC <= toYear)))
                  OR ((timeType = 3) AND
                      (qtnckh.NGAY_NGHIEM_THU IS NOT NULL AND (fromYear IS NULL OR qtnckh.NGAY_NGHIEM_THU >= fromYear))
                      AND (qtnckh.NGAY_NGHIEM_THU IS NOT NULL AND (toYear IS NULL OR qtnckh.NGAY_NGHIEM_THU <= toYear)))
                  )
                AND (searchTerm = ''
                  OR LOWER(CB.SHCC) LIKE sT
                  OR LOWER(TRIM(CB.HO || ' ' || CB.TEN)) LIKE sT
                  OR LOWER(TRIM(qtnckh.TEN_DE_TAI)) LIKE sT
                  OR LOWER(TRIM(qtnckh.VAI_TRO)) LIKE sT
                  OR LOWER(TRIM(qtnckh.KET_QUA)) LIKE sT
                  OR LOWER(TRIM(qtnckh.MA_SO_CAP_QUAN_LY)) LIKE sT)
              ORDER BY qtnckh.BAT_DAU DESC NULLS LAST)
        WHERE R BETWEEN (pageNumber - 1) * pageSize + 1 AND pageNumber * pageSize;
    RETURN my_cursor;

END;

/
--EndMethod--

CREATE OR REPLACE FUNCTION QT_NGHIEN_CUU_KHOA_HOC_USER_PAGE(staffEMAIL IN STRING) RETURN SYS_REFCURSOR
AS
    my_cursor SYS_REFCURSOR;
BEGIN
    OPEN my_cursor FOR
        SELECT NCKH.SHCC                 AS              "shcc",
               NCKH.ID                   AS              "id",
               NCKH.TEN_DE_TAI           AS              "tenDeTai",
               NCKH.MA_SO_CAP_QUAN_LY    AS              "maSoCapQuanLy",
               NCKH.KINH_PHI             AS              "kinhPhi",
               NCKH.BAT_DAU              AS              "batDau",
               NCKH.BAT_DAU_TYPE         AS              "batDauType",
               NCKH.KET_THUC             AS              "ketThuc",
               NCKH.KET_THUC_TYPE        AS              "ketThucType",
               NCKH.NGAY_NGHIEM_THU      AS              "ngayNghiemThu",
               NCKH.NGAY_NGHIEM_THU_TYPE AS              "ngayNghiemThuType",
               NCKH.VAI_TRO              AS              "vaiTro",
               NCKH.KET_QUA              AS              "ketQua",
               NCKH.THOI_GIAN            AS              "thoiGian",
               NCKH.SHCC                 AS              "shcc",

               cb.HO                     AS              "hoCanBo",
               cb.TEN                    AS              "tenCanBo",
               ROW_NUMBER() OVER (ORDER BY NCKH.ID DESC) R
        FROM QT_NGHIEN_CUU_KHOA_HOC NCKH
                 LEFT JOIN TCHC_CAN_BO cb ON NCKH.SHCC = cb.SHCC
        WHERE cb.EMAIL = staffEMAIL
        ORDER BY NCKH.NGAY_NGHIEM_THU DESC ;
    RETURN my_cursor;
END;

/
--EndMethod--

CREATE OR REPLACE FUNCTION QT_NGHI_KHONG_LUONG_GROUP_PAGE(pageNumber IN OUT NUMBER, pageSize IN OUT NUMBER,
                                        list_shcc IN STRING, list_dv IN STRING,
                                        fromYear IN NUMBER, toYear IN NUMBER, tinhTrang IN NUMBER, timeType IN NUMBER, searchTerm IN STRING,
                                         totalItem OUT NUMBER, pageTotal OUT NUMBER) RETURN SYS_REFCURSOR
AS
    my_cursor SYS_REFCURSOR;
    sT        STRING(500) := '%' || lower(searchTerm) || '%';
    today   NUMBER;
BEGIN
    select (cast(sysdate as date) - cast(to_date('1970-01-01', 'YYYY-MM-DD') as date)) * 86400000 into today from dual;
    SELECT COUNT(*)
    INTO totalItem

    FROM (SELECT *
          FROM QT_NGHI_KHONG_LUONG
          WHERE ID IN (SELECT MAX(ID) FROM (SELECT * FROM QT_NGHI_KHONG_LUONG ORDER BY SHCC DESC) GROUP BY SHCC)) qtnkl
             LEFT JOIN TCHC_CAN_BO cb on qtnkl.SHCC = cb.SHCC
             LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA);

    IF pageNumber < 1 THEN pageNumber := 1; END IF;
    IF pageSize < 1 THEN pageSize := 1; END IF;
    pageTotal := CEIL(totalItem / pageSize);
    pageNumber := LEAST(pageNumber, pageTotal);

    OPEN my_cursor FOR
        SELECT *
        FROM (
                 SELECT qtnkl.ID            AS                       "id",
                        qtnkl.SHCC          AS                       "shcc",

                        qtnkl.HO            AS                       "ho",
                        qtnkl.TEN           AS                       "ten",

                        cb.HO              AS                       "hoCanBo",
                        cb.TEN             AS                       "tenCanBo",

                        (SELECT COUNT(*)
                         FROM QT_NGHI_KHONG_LUONG qtnkl_temp
                         WHERE qtnkl_temp.SHCC = qtnkl.SHCC
                            AND (timeType = 0 OR (timeType = 1
                               AND (fromYear IS NULL OR qtnkl.BAT_DAU IS NULL OR qtnkl.BAT_DAU >= fromYear)
                               AND (toYear IS NULL OR qtnkl.KET_THUC IS NULL OR qtnkl.KET_THUC <= toYear))
                               OR (timeType = 2 AND
                               (fromYear IS NULL OR qtnkl_temp.THOI_GIAN_DI_LAM IS NULL OR fromYear <= qtnkl_temp.THOI_GIAN_DI_LAM)
                                AND (toYear IS NULL OR qtnkl_temp.THOI_GIAN_DI_LAM IS NULL OR toYear >= qtnkl_temp.THOI_GIAN_DI_LAM))
                                   OR (timeType = 3 AND
                                    (fromYear IS NULL OR qtnkl_temp.THOI_GIAN_TRO_LAI_CONG_TAC IS NULL OR fromYear <= qtnkl_temp.THOI_GIAN_TRO_LAI_CONG_TAC)
                                AND (toYear IS NULL OR qtnkl_temp.THOI_GIAN_TRO_LAI_CONG_TAC IS NULL OR toYear >= qtnkl_temp.THOI_GIAN_TRO_LAI_CONG_TAC)))
                               AND (tinhTrang IS NULL OR ((qtnkl_temp.KET_THUC = -1 OR qtnkl_temp.KET_THUC >= today) AND tinhTrang = 2) OR
                                         (qtnkl_temp.KET_THUC IS NOT NULL AND qtnkl_temp.KET_THUC != -1 AND qtnkl_temp.KET_THUC < today AND tinhTrang = 1))
                        ) AS "soLanNghi",

                        (select rtrim(xmlagg(xmlelement(e, qtnkl_temp.BAT_DAU || ' ','??').extract('//text()') order by null).getclobval(),'??')
                         FROM QT_NGHI_KHONG_LUONG qtnkl_temp
                         WHERE qtnkl_temp.SHCC = qtnkl.SHCC
                            AND (timeType = 0 OR (timeType = 1
                               AND (fromYear IS NULL OR qtnkl.BAT_DAU IS NULL OR qtnkl.BAT_DAU >= fromYear)
                               AND (toYear IS NULL OR qtnkl.KET_THUC IS NULL OR qtnkl.KET_THUC <= toYear))
                               OR (timeType = 2 AND
                               (fromYear IS NULL OR qtnkl_temp.THOI_GIAN_DI_LAM IS NULL OR fromYear <= qtnkl_temp.THOI_GIAN_DI_LAM)
                                AND (toYear IS NULL OR qtnkl_temp.THOI_GIAN_DI_LAM IS NULL OR toYear >= qtnkl_temp.THOI_GIAN_DI_LAM))
                                   OR (timeType = 3 AND
                                    (fromYear IS NULL OR qtnkl_temp.THOI_GIAN_TRO_LAI_CONG_TAC IS NULL OR fromYear <= qtnkl_temp.THOI_GIAN_TRO_LAI_CONG_TAC)
                                AND (toYear IS NULL OR qtnkl_temp.THOI_GIAN_TRO_LAI_CONG_TAC IS NULL OR toYear >= qtnkl_temp.THOI_GIAN_TRO_LAI_CONG_TAC)))
                               AND (tinhTrang IS NULL OR ((qtnkl_temp.KET_THUC = -1 OR qtnkl_temp.KET_THUC >= today) AND tinhTrang = 2) OR
                                         (qtnkl_temp.KET_THUC IS NOT NULL AND qtnkl_temp.KET_THUC != -1 AND qtnkl_temp.KET_THUC < today AND tinhTrang = 1))
                        ) AS "dsBatDau",

                        (select rtrim(xmlagg(xmlelement(e, qtnkl_temp.BAT_DAU_TYPE || ' ','??').extract('//text()') order by null).getclobval(),'??')
                         FROM QT_NGHI_KHONG_LUONG qtnkl_temp
                         WHERE qtnkl_temp.SHCC = qtnkl.SHCC
                            AND (timeType = 0 OR (timeType = 1
                               AND (fromYear IS NULL OR qtnkl.BAT_DAU IS NULL OR qtnkl.BAT_DAU >= fromYear)
                               AND (toYear IS NULL OR qtnkl.KET_THUC IS NULL OR qtnkl.KET_THUC <= toYear))
                               OR (timeType = 2 AND
                               (fromYear IS NULL OR qtnkl_temp.THOI_GIAN_DI_LAM IS NULL OR fromYear <= qtnkl_temp.THOI_GIAN_DI_LAM)
                                AND (toYear IS NULL OR qtnkl_temp.THOI_GIAN_DI_LAM IS NULL OR toYear >= qtnkl_temp.THOI_GIAN_DI_LAM))
                                   OR (timeType = 3 AND
                                    (fromYear IS NULL OR qtnkl_temp.THOI_GIAN_TRO_LAI_CONG_TAC IS NULL OR fromYear <= qtnkl_temp.THOI_GIAN_TRO_LAI_CONG_TAC)
                                AND (toYear IS NULL OR qtnkl_temp.THOI_GIAN_TRO_LAI_CONG_TAC IS NULL OR toYear >= qtnkl_temp.THOI_GIAN_TRO_LAI_CONG_TAC)))
                               AND (tinhTrang IS NULL OR ((qtnkl_temp.KET_THUC = -1 OR qtnkl_temp.KET_THUC >= today) AND tinhTrang = 2) OR
                                         (qtnkl_temp.KET_THUC IS NOT NULL AND qtnkl_temp.KET_THUC != -1 AND qtnkl_temp.KET_THUC < today AND tinhTrang = 1))
                        ) AS "dsBatDauType",

                        (select rtrim(xmlagg(xmlelement(e, qtnkl_temp.KET_THUC || ' ','??').extract('//text()') order by null).getclobval(),'??')
                         FROM QT_NGHI_KHONG_LUONG qtnkl_temp
                         WHERE qtnkl_temp.SHCC = qtnkl.SHCC
                            AND (timeType = 0 OR (timeType = 1
                               AND (fromYear IS NULL OR qtnkl.BAT_DAU IS NULL OR qtnkl.BAT_DAU >= fromYear)
                               AND (toYear IS NULL OR qtnkl.KET_THUC IS NULL OR qtnkl.KET_THUC <= toYear))
                               OR (timeType = 2 AND
                               (fromYear IS NULL OR qtnkl_temp.THOI_GIAN_DI_LAM IS NULL OR fromYear <= qtnkl_temp.THOI_GIAN_DI_LAM)
                                AND (toYear IS NULL OR qtnkl_temp.THOI_GIAN_DI_LAM IS NULL OR toYear >= qtnkl_temp.THOI_GIAN_DI_LAM))
                                   OR (timeType = 3 AND
                                    (fromYear IS NULL OR qtnkl_temp.THOI_GIAN_TRO_LAI_CONG_TAC IS NULL OR fromYear <= qtnkl_temp.THOI_GIAN_TRO_LAI_CONG_TAC)
                                AND (toYear IS NULL OR qtnkl_temp.THOI_GIAN_TRO_LAI_CONG_TAC IS NULL OR toYear >= qtnkl_temp.THOI_GIAN_TRO_LAI_CONG_TAC)))
                               AND (tinhTrang IS NULL OR ((qtnkl_temp.KET_THUC = -1 OR qtnkl_temp.KET_THUC >= today) AND tinhTrang = 2) OR
                                         (qtnkl_temp.KET_THUC IS NOT NULL AND qtnkl_temp.KET_THUC != -1 AND qtnkl_temp.KET_THUC < today AND tinhTrang = 1))
                        ) AS "dsKetThuc",

                        (select rtrim(xmlagg(xmlelement(e, qtnkl_temp.KET_THUC_TYPE || ' ','??').extract('//text()') order by null).getclobval(),'??')
                         FROM QT_NGHI_KHONG_LUONG qtnkl_temp
                         WHERE qtnkl_temp.SHCC = qtnkl.SHCC
                            AND (timeType = 0 OR (timeType = 1
                               AND (fromYear IS NULL OR qtnkl.BAT_DAU IS NULL OR qtnkl.BAT_DAU >= fromYear)
                               AND (toYear IS NULL OR qtnkl.KET_THUC IS NULL OR qtnkl.KET_THUC <= toYear))
                               OR (timeType = 2 AND
                               (fromYear IS NULL OR qtnkl_temp.THOI_GIAN_DI_LAM IS NULL OR fromYear <= qtnkl_temp.THOI_GIAN_DI_LAM)
                                AND (toYear IS NULL OR qtnkl_temp.THOI_GIAN_DI_LAM IS NULL OR toYear >= qtnkl_temp.THOI_GIAN_DI_LAM))
                                   OR (timeType = 3 AND
                                    (fromYear IS NULL OR qtnkl_temp.THOI_GIAN_TRO_LAI_CONG_TAC IS NULL OR fromYear <= qtnkl_temp.THOI_GIAN_TRO_LAI_CONG_TAC)
                                AND (toYear IS NULL OR qtnkl_temp.THOI_GIAN_TRO_LAI_CONG_TAC IS NULL OR toYear >= qtnkl_temp.THOI_GIAN_TRO_LAI_CONG_TAC)))
                               AND (tinhTrang IS NULL OR ((qtnkl_temp.KET_THUC = -1 OR qtnkl_temp.KET_THUC >= today) AND tinhTrang = 2) OR
                                         (qtnkl_temp.KET_THUC IS NOT NULL AND qtnkl_temp.KET_THUC != -1 AND qtnkl_temp.KET_THUC < today AND tinhTrang = 1))
                        ) AS "dsKetThucType",

                        ROW_NUMBER() OVER (ORDER BY qtnkl.BAT_DAU DESC) R
                     FROM (SELECT *
          FROM QT_NGHI_KHONG_LUONG
          WHERE ID IN (SELECT MAX(ID) FROM (SELECT * FROM QT_NGHI_KHONG_LUONG ORDER BY SHCC DESC) GROUP BY SHCC)) qtnkl
                          LEFT JOIN TCHC_CAN_BO cb on qtnkl.SHCC = cb.SHCC
                          LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
                 WHERE ((list_shcc IS NOT NULL AND INSTR(list_shcc, qtnkl.SHCC) != 0)
                      OR (list_dv IS NOT NULL AND INSTR(list_dv, cb.MA_DON_VI) != 0)
                      OR (list_shcc IS NULL AND list_dv IS NULL))
                       AND (timeType = 0 OR (timeType = 1
                       AND (fromYear IS NULL OR qtnkl.BAT_DAU IS NULL OR qtnkl.BAT_DAU >= fromYear)
                       AND (toYear IS NULL OR qtnkl.KET_THUC IS NULL OR qtnkl.KET_THUC <= toYear))
                       OR (timeType = 2 AND
                       (fromYear IS NULL OR qtnkl.THOI_GIAN_DI_LAM IS NULL OR fromYear <= qtnkl.THOI_GIAN_DI_LAM)
                        AND (toYear IS NULL OR qtnkl.THOI_GIAN_DI_LAM IS NULL OR toYear >= qtnkl.THOI_GIAN_DI_LAM))
                           OR (timeType = 3 AND
                            (fromYear IS NULL OR qtnkl.THOI_GIAN_TRO_LAI_CONG_TAC IS NULL OR fromYear <= qtnkl.THOI_GIAN_TRO_LAI_CONG_TAC)
                        AND (toYear IS NULL OR qtnkl.THOI_GIAN_TRO_LAI_CONG_TAC IS NULL OR toYear >= qtnkl.THOI_GIAN_TRO_LAI_CONG_TAC)))
                       AND (tinhTrang IS NULL OR ((qtnkl.KET_THUC = -1 OR qtnkl.KET_THUC >= today) AND tinhTrang = 2) OR
                                 (qtnkl.KET_THUC IS NOT NULL AND qtnkl.KET_THUC != -1 AND qtnkl.KET_THUC < today AND tinhTrang = 1))
                  AND (searchTerm = ''
                        OR LOWER(cb.SHCC) LIKE sT
                        OR LOWER(TRIM(cb.HO || ' ' || cb.TEN)) LIKE sT
                        OR LOWER(qtnkl.SO_VAN_BAN) LIKE sT
                        OR LOWER(qtnkl.SO_THONG_BAO) LIKE sT
                        OR LOWER(qtnkl.THONG_BAO_SO) LIKE sT
                        OR LOWER(qtnkl.GHI_CHU) LIKE sT)
                 ORDER BY qtnkl.BAT_DAU DESC
             )
        WHERE R BETWEEN (pageNumber - 1) * pageSize + 1 AND pageNumber * pageSize;
    RETURN my_cursor;

END;

/
--EndMethod--

CREATE OR REPLACE FUNCTION QT_NGHI_KHONG_LUONG_SEARCH_PAGE(pageNumber IN OUT NUMBER, pageSize IN OUT NUMBER,
                                        list_shcc IN STRING, list_dv IN STRING,
                                        fromYear IN NUMBER, toYear IN NUMBER, tinhTrang IN NUMBER, timeType IN NUMBER, searchTerm IN STRING,
                                         totalItem OUT NUMBER, pageTotal OUT NUMBER) RETURN SYS_REFCURSOR
AS
    my_cursor SYS_REFCURSOR;
    sT        STRING(500) := '%' || lower(searchTerm) || '%';
    today     NUMBER(20);
BEGIN
    select (cast(sysdate as date) - cast(to_date('1970-01-01', 'YYYY-MM-DD') as date)) * 86400000 into today from dual;
    SELECT COUNT(*)
    INTO totalItem

    FROM QT_NGHI_KHONG_LUONG qtnkl
             LEFT JOIN TCHC_CAN_BO cb on qtnkl.SHCC = cb.SHCC
             LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
     WHERE (((list_shcc IS NOT NULL AND INSTR(list_shcc, qtnkl.SHCC) != 0)
      OR (list_dv IS NOT NULL AND INSTR(list_dv, cb.MA_DON_VI) != 0)
      OR (list_shcc IS NULL AND list_dv IS NULL))
       AND (timeType = 0 OR (timeType = 1
       AND (fromYear IS NULL OR qtnkl.BAT_DAU IS NULL OR qtnkl.BAT_DAU >= fromYear)
       AND (toYear IS NULL OR qtnkl.KET_THUC IS NULL OR qtnkl.KET_THUC <= toYear))
       OR (timeType = 2 AND
       (fromYear IS NULL OR qtnkl.THOI_GIAN_DI_LAM IS NULL OR fromYear <= qtnkl.THOI_GIAN_DI_LAM)
        AND (toYear IS NULL OR qtnkl.THOI_GIAN_DI_LAM IS NULL OR toYear >= qtnkl.THOI_GIAN_DI_LAM))
           OR (timeType = 3 AND
            (fromYear IS NULL OR qtnkl.THOI_GIAN_TRO_LAI_CONG_TAC IS NULL OR fromYear <= qtnkl.THOI_GIAN_TRO_LAI_CONG_TAC)
        AND (toYear IS NULL OR qtnkl.THOI_GIAN_TRO_LAI_CONG_TAC IS NULL OR toYear >= qtnkl.THOI_GIAN_TRO_LAI_CONG_TAC)))
       AND (tinhTrang IS NULL OR ((qtnkl.KET_THUC = -1 OR qtnkl.KET_THUC >= today) AND tinhTrang = 2) OR
                 (qtnkl.KET_THUC IS NOT NULL AND qtnkl.KET_THUC != -1 AND qtnkl.KET_THUC < today AND tinhTrang = 1)))
      AND (searchTerm = ''
        OR LOWER(cb.SHCC) LIKE sT
        OR LOWER(TRIM(cb.HO || ' ' || cb.TEN)) LIKE sT
        OR LOWER(qtnkl.SO_VAN_BAN) LIKE sT
        OR LOWER(qtnkl.SO_THONG_BAO) LIKE sT
        OR LOWER(qtnkl.THONG_BAO_SO) LIKE sT
        OR LOWER(qtnkl.GHI_CHU) LIKE sT);

    IF pageNumber < 1 THEN pageNumber := 1; END IF;
    IF pageSize < 1 THEN pageSize := 1; END IF;
    pageTotal := CEIL(totalItem / pageSize);
    pageNumber := LEAST(pageNumber, pageTotal);

    OPEN my_cursor FOR
        SELECT *
        FROM (
                 SELECT qtnkl.ID            AS                       "id",
                        qtnkl.HO            AS                       "ho",
                        qtnkl.TEN           AS                       "ten",
                        qtnkl.SHCC          AS                       "shcc",
                        qtnkl.TEMP          AS                       "temp",
                        qtnkl.SO_VAN_BAN       AS                       "soVanBan",
                        qtnkl.THOI_GIAN_DI_LAM                  AS            "thoiGianDiLam",
                        qtnkl.GHI_CHU            AS                  "ghiChu",
                        qtnkl.SO_THONG_BAO     AS                "soThongBao",
                        qtnkl.TONG_THOI_GIAN     AS              "tongThoiGian",
                        qtnkl.BAT_DAU                AS              "batDau",
                        qtnkl.BAT_DAU_TYPE           AS              "batDauType",
                        qtnkl.KET_THUC               AS              "ketThuc",
                        qtnkl.KET_THUC_TYPE          AS              "ketThucType",
                        qtnkl.THOI_GIAN_TRO_LAI_CONG_TAC               AS             "thoiGianTroLaiCongTac",
                        qtnkl.THONG_BAO_SO           AS               "thongBaoSo",
                        qtnkl.THAM_GIA_BHXH          AS                 "thamGiaBHXH",
                        qtnkl.THOI_GIAN_BAO_GIAM     AS                 "thoiGianBaoGiam",
                        qtnkl.THOI_GIAN_BAO_TANG     AS                 "thoiGianBaoTang",

                        today                       AS              "today",

                        cb.HO              AS                       "hoCanBo",
                        cb.TEN             AS                       "tenCanBo",

                        dv.MA              AS                       "maDonVi",
                        dv.TEN             AS                       "tenDonVi",

                        ROW_NUMBER() OVER (ORDER BY qtnkl.BAT_DAU DESC) R
                 FROM QT_NGHI_KHONG_LUONG qtnkl
                          LEFT JOIN TCHC_CAN_BO cb on qtnkl.SHCC = cb.SHCC
                          LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
                  WHERE ((list_shcc IS NOT NULL AND INSTR(list_shcc, qtnkl.SHCC) != 0)
                      OR (list_dv IS NOT NULL AND INSTR(list_dv, cb.MA_DON_VI) != 0)
                      OR (list_shcc IS NULL AND list_dv IS NULL))
                       AND (fromYear IS NULL OR qtnkl.BAT_DAU IS NULL OR qtnkl.BAT_DAU >= fromYear)
                       AND (toYear IS NULL OR qtnkl.BAT_DAU IS NULL OR qtnkl.BAT_DAU <= toYear)
                    AND (tinhTrang IS NULL OR ((qtnkl.KET_THUC = -1 OR qtnkl.KET_THUC >= today) AND tinhTrang = 2) OR
                        (qtnkl.KET_THUC IS NOT NULL AND qtnkl.KET_THUC != -1 AND qtnkl.KET_THUC < today AND tinhTrang = 1))
                      AND (searchTerm = ''
                            OR LOWER(cb.SHCC) LIKE sT
                            OR LOWER(TRIM(cb.HO || ' ' || cb.TEN)) LIKE sT
                            OR LOWER(qtnkl.SO_VAN_BAN) LIKE sT
                            OR LOWER(qtnkl.SO_THONG_BAO) LIKE sT
                            OR LOWER(qtnkl.THONG_BAO_SO) LIKE sT
                            OR LOWER(qtnkl.GHI_CHU) LIKE sT)
                 ORDER BY qtnkl.BAT_DAU DESC
             )
        WHERE R BETWEEN (pageNumber - 1) * pageSize + 1 AND pageNumber * pageSize;
    RETURN my_cursor;

END;

/
--EndMethod--

CREATE OR REPLACE FUNCTION QT_NGHI_PHEP_DOWNLOAD_EXCEL(filter IN STRING) RETURN SYS_REFCURSOR
AS
    my_cursor SYS_REFCURSOR;
    today     NUMBER(20);
    list_shcc STRING(100);
    list_dv   STRING(100);
    fromYear  NUMBER;
    toYear    NUMBER;
    tinhTrang NUMBER;
    lyDo      STRING(100);
BEGIN
    /* Init filter */-------------------------------------------------------------------------------------
    SELECT JSON_VALUE(filter, '$.listDv') INTO list_dv FROM DUAL;
    SELECT JSON_VALUE(filter, '$.listShcc') INTO list_shcc FROM DUAL;
    SELECT JSON_VALUE(filter, '$.fromYear') INTO fromYear FROM DUAL;
    SELECT JSON_VALUE(filter, '$.toYear') INTO toYear FROM DUAL;
    SELECT JSON_VALUE(filter, '$.tinhTrang') INTO tinhTrang FROM DUAL;
    SELECT JSON_VALUE(filter, '$.lyDo') INTO lyDo FROM DUAL;

    select (cast(sysdate as date) - cast(to_date('1970-01-01', 'YYYY-MM-DD') as date)) * 86400000 into today from dual;

    OPEN my_cursor FOR
        SELECT *
        FROM (SELECT qtnp.ID                   AS                   "id",
                     qtnp.SHCC                 AS                   "shcc",
                     qtnp.LY_DO                AS                   "lyDo",
                     qtnp.LY_DO_KHAC           AS                   "lyDoKhac",
                     qtnp.NOI_DEN              AS                   "noiDen",
                     qtnp.GHI_CHU              AS                   "ghiChu",
                     qtnp.BAT_DAU              AS                   "batDau",
                     qtnp.BAT_DAU_TYPE         AS                   "batDauType",
                     qtnp.KET_THUC             AS                   "ketThuc",
                     qtnp.KET_THUC_TYPE        AS                   "ketThucType",
                     qtnp.NGAY_DI_DUONG        AS                   "ngayDiDuong",

                     today                     AS                   "today",

                     cb.HO                     AS                   "hoCanBo",
                     cb.TEN                    AS                   "tenCanBo",
                     cb.NGAY_BAT_DAU_CONG_TAC  AS                   "ngayBatDauCongTac",

                     dmnp.MA                   AS                   "maNghiPhep",
                     dmnp.TEN                  AS                   "tenNghiPhep",
                     dmnp.SO_NGAY_PHEP         AS                   "ngayNghiPhep",

                     dv.MA                     AS                   "maDonVi",
                     dv.TEN                    AS                   "tenDonVi",
                     (SELECT DMCV.TEN
                      FROM QT_CHUC_VU QTCV
                               LEFT JOIN DM_CHUC_VU DMCV ON DMCV.MA = QTCV.MA_CHUC_VU
                      WHERE QTCV.SHCC = CB.SHCC
                        AND CHUC_VU_CHINH = 1) AS                   "tenChucVu",

                     (SELECT QTCV.MA_CHUC_VU
                      FROM QT_CHUC_VU QTCV
                      WHERE QTCV.SHCC = CB.SHCC
                        AND CHUC_VU_CHINH = 1) AS                   "maChucVu",
                     td.MA                     AS                   "maHocVi",
                     td.TEN                    AS                   "tenHocVi",

                     cdnn.MA                   AS                   "maChucDanhNgheNghiep",
                     cdnn.TEN                  AS                   "tenChucDanhNgheNghiep",
                     ROW_NUMBER() OVER (ORDER BY qtnp.BAT_DAU DESC) R
              FROM QT_NGHI_PHEP qtnp
                       LEFT JOIN TCHC_CAN_BO cb on qtnp.SHCC = cb.SHCC
                       LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
                       LEFT JOIN DM_TRINH_DO td ON (cb.HOC_VI = td.MA)
                       LEFT JOIN DM_NGACH_CDNN cdnn ON (cdnn.MA = cb.NGACH)
                       LEFT JOIN DM_NGHI_PHEP dmnp ON (qtnp.LY_DO = dmnp.MA)
              WHERE (((list_shcc IS NULL) AND (list_dv IS NULL) AND (fromYear IS NULL) AND (toYear IS NULL) AND
                      (tinhTrang IS NULL) AND (lyDo IS NULL))
                  OR (((list_shcc IS NOT NULL AND cb.SHCC IN (SELECT regexp_substr(list_shcc, '[^,]+', 1, level)
                                                              from dual
                                                              connect by regexp_substr(list_shcc, '[^,]+', 1, level) is not null))
                      OR (list_dv IS NOT NULL AND cb.MA_DON_VI IN (SELECT regexp_substr(list_dv, '[^,]+', 1, level)
                                                                   from dual
                                                                   connect by regexp_substr(list_dv, '[^,]+', 1, level) is not null))
                      OR (list_shcc IS NULL AND list_dv IS NULL))
                      AND (tinhTrang IS NULL OR
                           (qtnp.BAT_DAU <= today and qtnp.KET_THUC >= today AND tinhTrang = 2) OR
                           (qtnp.KET_THUC IS NOT NULL AND qtnp.KET_THUC < today AND tinhTrang = 1) OR
                           (qtnp.KET_THUC IS NOT NULL AND qtnp.BAT_DAU > today AND tinhTrang = 3))
                      AND (qtnp.BAT_DAU IS NOT NULL AND (fromYear IS NULL OR qtnp.BAT_DAU >= fromYear))
                      AND (qtnp.BAT_DAU IS NOT NULL AND (toYear IS NULL OR qtnp.BAT_DAU <= toYear))))
                AND (lyDo IS NULL OR (qtnp.LY_DO IN (SELECT regexp_substr(lyDo, '[^,]+', 1, level)
                                                     from dual
                                                     connect by regexp_substr(lyDo, '[^,]+', 1, level) is not null)))
              ORDER BY qtnp.BAT_DAU);
    RETURN my_cursor;

END;

/
--EndMethod--

CREATE OR REPLACE FUNCTION QT_NGHI_PHEP_GROUP_PAGE(pageNumber IN OUT NUMBER, pageSize IN OUT NUMBER,
                                        filter IN STRING, searchTerm IN STRING,
                                        totalItem OUT NUMBER, pageTotal OUT NUMBER) RETURN SYS_REFCURSOR
AS
    my_cursor SYS_REFCURSOR;
    sT        STRING(500) := '%' || lower(searchTerm) || '%';
    today     NUMBER;
    list_shcc STRING(100);
    list_dv   STRING(100);
    fromYear  NUMBER;
    toYear    NUMBER;
    tinhTrang NUMBER;
    lyDo      STRING(100);
BEGIN
    /* Init filter */-------------------------------------------------------------------------------------
    SELECT JSON_VALUE(filter, '$.listDv') INTO list_dv FROM DUAL;
    SELECT JSON_VALUE(filter, '$.listShcc') INTO list_shcc FROM DUAL;
    SELECT JSON_VALUE(filter, '$.fromYear') INTO fromYear FROM DUAL;
    SELECT JSON_VALUE(filter, '$.toYear') INTO toYear FROM DUAL;
    SELECT JSON_VALUE(filter, '$.tinhTrang') INTO tinhTrang FROM DUAL;
    SELECT JSON_VALUE(filter, '$.lyDo') INTO lyDo FROM DUAL;

    select (cast(sysdate as date) - cast(to_date('1970-01-01', 'YYYY-MM-DD') as date)) * 86400000 into today from dual;
    SELECT COUNT(*)
    INTO totalItem

    FROM (SELECT *
          FROM QT_NGHI_PHEP
          WHERE ID IN (SELECT MAX(ID) FROM (SELECT * FROM QT_NGHI_PHEP ORDER BY SHCC DESC) GROUP BY SHCC)) qtnp
             LEFT JOIN TCHC_CAN_BO cb on qtnp.SHCC = cb.SHCC
             LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
             LEFT JOIN DM_TRINH_DO td ON (cb.HOC_VI = td.MA)
             LEFT JOIN DM_NGACH_CDNN cdnn ON (cdnn.MA = cb.NGACH);

    IF pageNumber < 1 THEN pageNumber := 1; END IF;
    IF pageSize < 1 THEN pageSize := 1; END IF;
    pageTotal := CEIL(totalItem / pageSize);
    pageNumber := LEAST(pageNumber, pageTotal);

    OPEN my_cursor FOR
        SELECT *
        FROM (SELECT qtnp.ID                                    AS  "id",
                     qtnp.SHCC                                  AS  "shcc",

                     cb.HO                                      AS  "hoCanBo",
                     cb.TEN                                     AS  "tenCanBo",

                     (SELECT COUNT(*)
                      FROM QT_NGHI_PHEP qtnp_temp
                               LEFT JOIN TCHC_CAN_BO cb on qtnp_temp.SHCC = cb.SHCC
                               LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
                               LEFT JOIN DM_CHUC_VU cv ON (cb.MA_CHUC_VU = cv.MA)
                               LEFT JOIN DM_TRINH_DO td ON (cb.HOC_VI = td.MA)
                               LEFT JOIN DM_NGACH_CDNN cdnn ON (cdnn.MA = cb.NGACH)
                               LEFT JOIN DM_NGHI_PHEP dmnp ON (qtnp_temp.LY_DO = dmnp.MA)
                      WHERE (qtnp_temp.SHCC = qtnp.SHCC)
                        AND (((list_shcc IS NULL) AND (list_dv IS NULL) AND (fromYear IS NULL) AND (toYear IS NULL) AND
                              (tinhTrang IS NULL) AND (lyDo IS NULL))
                          OR (((list_shcc IS NOT NULL AND cb.SHCC IN (SELECT regexp_substr(list_shcc, '[^,]+', 1, level)
                                                                      from dual
                                                                      connect by regexp_substr(list_shcc, '[^,]+', 1, level) is not null))
                              OR (list_dv IS NOT NULL AND
                                  cb.MA_DON_VI IN (SELECT regexp_substr(list_dv, '[^,]+', 1, level)
                                                   from dual
                                                   connect by regexp_substr(list_dv, '[^,]+', 1, level) is not null))
                              OR (list_shcc IS NULL AND list_dv IS NULL))
                              AND (tinhTrang IS NULL OR
                                   (qtnp_temp.BAT_DAU <= today and qtnp_temp.KET_THUC >= today AND tinhTrang = 2) OR
                                   (qtnp_temp.KET_THUC IS NOT NULL AND qtnp_temp.KET_THUC < today AND tinhTrang = 1) OR
                                   (qtnp_temp.KET_THUC IS NOT NULL AND qtnp_temp.BAT_DAU > today AND tinhTrang = 3))
                              AND
                              (qtnp_temp.BAT_DAU IS NOT NULL AND (fromYear IS NULL OR qtnp_temp.BAT_DAU >= fromYear))
                              AND (qtnp_temp.BAT_DAU IS NOT NULL AND (toYear IS NULL OR qtnp_temp.BAT_DAU <= toYear))))
                        AND (lyDo IS NULL OR (qtnp_temp.LY_DO IN (SELECT regexp_substr(lyDo, '[^,]+', 1, level)
                                                                  from dual
                                                                  connect by regexp_substr(lyDo, '[^,]+', 1, level) is not null)))
                        AND (searchTerm = ''
                          OR LOWER(cb.SHCC) LIKE sT
                          OR LOWER(TRIM(cb.HO || ' ' || cb.TEN)) LIKE sT
                          OR LOWER(qtnp_temp.LY_DO_KHAC) LIKE sT
                          OR LOWER(qtnp_temp.NOI_DEN) LIKE sT
                          OR LOWER(dmnp.TEN) LIKE sT
                          OR LOWER(qtnp_temp.GHI_CHU) LIKE sT)) AS  "soLanNghi",

                     (select rtrim(xmlagg(
                                           xmlelement(e, dmnp.TEN || ':' || qtnp_temp.LY_DO_KHAC, '??').extract('//text()')
                                           order by null).getclobval(), '??')
                      FROM QT_NGHI_PHEP qtnp_temp
                               LEFT JOIN TCHC_CAN_BO cb on qtnp_temp.SHCC = cb.SHCC
                               LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
                               LEFT JOIN DM_CHUC_VU cv ON (cb.MA_CHUC_VU = cv.MA)
                               LEFT JOIN DM_TRINH_DO td ON (cb.HOC_VI = td.MA)
                               LEFT JOIN DM_NGACH_CDNN cdnn ON (cdnn.MA = cb.NGACH)
                               LEFT JOIN DM_NGHI_PHEP dmnp ON (qtnp_temp.LY_DO = dmnp.MA)
                      WHERE (qtnp_temp.SHCC = qtnp.SHCC)
                        AND (((list_shcc IS NULL) AND (list_dv IS NULL) AND (fromYear IS NULL) AND (toYear IS NULL) AND
                              (tinhTrang IS NULL) AND (lyDo IS NULL))
                          OR (((list_shcc IS NOT NULL AND cb.SHCC IN (SELECT regexp_substr(list_shcc, '[^,]+', 1, level)
                                                                      from dual
                                                                      connect by regexp_substr(list_shcc, '[^,]+', 1, level) is not null))
                              OR (list_dv IS NOT NULL AND
                                  cb.MA_DON_VI IN (SELECT regexp_substr(list_dv, '[^,]+', 1, level)
                                                   from dual
                                                   connect by regexp_substr(list_dv, '[^,]+', 1, level) is not null))
                              OR (list_shcc IS NULL AND list_dv IS NULL))
                              AND (tinhTrang IS NULL OR
                                   (qtnp_temp.BAT_DAU <= today and qtnp_temp.KET_THUC >= today AND tinhTrang = 2) OR
                                   (qtnp_temp.KET_THUC IS NOT NULL AND qtnp_temp.KET_THUC < today AND tinhTrang = 1) OR
                                   (qtnp_temp.KET_THUC IS NOT NULL AND qtnp_temp.BAT_DAU > today AND tinhTrang = 3))
                              AND
                              (qtnp_temp.BAT_DAU IS NOT NULL AND (fromYear IS NULL OR qtnp_temp.BAT_DAU >= fromYear))
                              AND (qtnp_temp.BAT_DAU IS NOT NULL AND (toYear IS NULL OR qtnp_temp.BAT_DAU <= toYear))))
                        AND (lyDo IS NULL OR (qtnp_temp.LY_DO IN (SELECT regexp_substr(lyDo, '[^,]+', 1, level)
                                                                  from dual
                                                                  connect by regexp_substr(lyDo, '[^,]+', 1, level) is not null)))
                        AND (searchTerm = ''
                          OR LOWER(cb.SHCC) LIKE sT
                          OR LOWER(TRIM(cb.HO || ' ' || cb.TEN)) LIKE sT
                          OR LOWER(qtnp_temp.LY_DO_KHAC) LIKE sT
                          OR LOWER(qtnp_temp.NOI_DEN) LIKE sT
                          OR LOWER(dmnp.TEN) LIKE sT
                          OR LOWER(qtnp_temp.GHI_CHU) LIKE sT)) AS  "danhSachLyDoNghi",

                     dv.MA                                      AS  "maDonVi",
                     dv.TEN                                     AS  "tenDonVi",
                     (SELECT DMCV.TEN
                      FROM QT_CHUC_VU QTCV
                               LEFT JOIN DM_CHUC_VU DMCV ON DMCV.MA = QTCV.MA_CHUC_VU
                      WHERE QTCV.SHCC = CB.SHCC
                        AND CHUC_VU_CHINH = 1)                  AS  "tenChucVu",

                     (SELECT QTCV.MA_CHUC_VU
                      FROM QT_CHUC_VU QTCV
                      WHERE QTCV.SHCC = CB.SHCC
                        AND CHUC_VU_CHINH = 1)                  AS  "maChucVu",
                     td.MA                                      AS  "maHocVi",
                     td.TEN                                     AS  "tenHocVi",

                     cdnn.MA                                    AS  "maChucDanhNgheNghiep",
                     cdnn.TEN                                   AS  "tenChucDanhNgheNghiep",
                     ROW_NUMBER() OVER (ORDER BY qtnp.BAT_DAU DESC) R
              FROM (SELECT *
                    FROM QT_NGHI_PHEP
                    WHERE ID IN
                          (SELECT MAX(ID) FROM (SELECT * FROM QT_NGHI_PHEP ORDER BY SHCC DESC) GROUP BY SHCC)) qtnp
                       LEFT JOIN TCHC_CAN_BO cb on qtnp.SHCC = cb.SHCC
                       LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
                       LEFT JOIN DM_TRINH_DO td ON (cb.HOC_VI = td.MA)
                       LEFT JOIN DM_NGACH_CDNN cdnn ON (cdnn.MA = cb.NGACH)
              ORDER BY qtnp.BAT_DAU DESC)
        WHERE R BETWEEN (pageNumber - 1) * pageSize + 1 AND pageNumber * pageSize;
    RETURN my_cursor;

END;

/
--EndMethod--

CREATE OR REPLACE FUNCTION QT_NGHI_PHEP_SEARCH_PAGE(pageNumber IN OUT NUMBER, pageSize IN OUT NUMBER,
                                         filter IN STRING, searchTerm IN STRING,
                                         totalItem OUT NUMBER, pageTotal OUT NUMBER) RETURN SYS_REFCURSOR
AS
    my_cursor SYS_REFCURSOR;
    sT        STRING(500) := '%' || lower(searchTerm) || '%';
    today     NUMBER(20);
    list_shcc STRING(100);
    list_dv   STRING(100);
    fromYear  NUMBER;
    toYear    NUMBER;
    tinhTrang NUMBER;
    lyDo      STRING(100);
BEGIN
    /* Init filter */-------------------------------------------------------------------------------------
    SELECT JSON_VALUE(filter, '$.listDv') INTO list_dv FROM DUAL;
    SELECT JSON_VALUE(filter, '$.listShcc') INTO list_shcc FROM DUAL;
    SELECT JSON_VALUE(filter, '$.fromYear') INTO fromYear FROM DUAL;
    SELECT JSON_VALUE(filter, '$.toYear') INTO toYear FROM DUAL;
    SELECT JSON_VALUE(filter, '$.tinhTrang') INTO tinhTrang FROM DUAL;
    SELECT JSON_VALUE(filter, '$.lyDo') INTO lyDo FROM DUAL;

    select (cast(sysdate as date) - cast(to_date('1970-01-01', 'YYYY-MM-DD') as date)) * 86400000 into today from dual;
    SELECT COUNT(*)
    INTO totalItem

    FROM QT_NGHI_PHEP qtnp
             LEFT JOIN TCHC_CAN_BO cb on qtnp.SHCC = cb.SHCC
             LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
             LEFT JOIN DM_TRINH_DO td ON (cb.HOC_VI = td.MA)
             LEFT JOIN DM_NGACH_CDNN cdnn ON (cdnn.MA = cb.NGACH)
             LEFT JOIN DM_NGHI_PHEP dmnp ON (qtnp.LY_DO = dmnp.MA)
    WHERE (((list_shcc IS NULL) AND (list_dv IS NULL) AND (fromYear IS NULL) AND (toYear IS NULL) AND
            (tinhTrang IS NULL) AND (lyDo IS NULL))
        OR (((list_shcc IS NOT NULL AND cb.SHCC IN (SELECT regexp_substr(list_shcc, '[^,]+', 1, level)
                                                    from dual
                                                    connect by regexp_substr(list_shcc, '[^,]+', 1, level) is not null))
            OR (list_dv IS NOT NULL AND cb.MA_DON_VI IN (SELECT regexp_substr(list_dv, '[^,]+', 1, level)
                                                         from dual
                                                         connect by regexp_substr(list_dv, '[^,]+', 1, level) is not null))
            OR (list_shcc IS NULL AND list_dv IS NULL))
            AND (tinhTrang IS NULL OR
                 (qtnp.BAT_DAU <= today and qtnp.KET_THUC >= today AND tinhTrang = 2) OR
                 (qtnp.KET_THUC IS NOT NULL AND qtnp.KET_THUC < today AND tinhTrang = 1) OR
                 (qtnp.KET_THUC IS NOT NULL AND qtnp.BAT_DAU > today AND tinhTrang = 3))
            AND (qtnp.BAT_DAU IS NOT NULL AND (fromYear IS NULL OR qtnp.BAT_DAU >= fromYear))
            AND (qtnp.BAT_DAU IS NOT NULL AND (toYear IS NULL OR qtnp.BAT_DAU <= toYear))))
      AND (lyDo IS NULL OR (qtnp.LY_DO IN (SELECT regexp_substr(lyDo, '[^,]+', 1, level)
                                           from dual
                                           connect by regexp_substr(lyDo, '[^,]+', 1, level) is not null)))
      AND (searchTerm = ''
        OR LOWER(cb.SHCC) LIKE sT
        OR LOWER(TRIM(cb.HO || ' ' || cb.TEN)) LIKE sT
        OR LOWER(qtnp.LY_DO_KHAC) LIKE sT
        OR LOWER(qtnp.NOI_DEN) LIKE sT
        OR LOWER(dmnp.TEN) LIKE sT
        OR LOWER(qtnp.GHI_CHU) LIKE sT);

    IF pageNumber < 1 THEN pageNumber := 1; END IF;
    IF pageSize < 1 THEN pageSize := 1; END IF;
    pageTotal := CEIL(totalItem / pageSize);
    pageNumber := LEAST(pageNumber, pageTotal);

    OPEN my_cursor FOR
        SELECT *
        FROM (SELECT qtnp.ID                   AS                   "id",
                     qtnp.SHCC                 AS                   "shcc",
                     qtnp.LY_DO                AS                   "lyDo",
                     qtnp.LY_DO_KHAC           AS                   "lyDoKhac",
                     qtnp.NOI_DEN              AS                   "noiDen",
                     qtnp.GHI_CHU              AS                   "ghiChu",
                     qtnp.BAT_DAU              AS                   "batDau",
                     qtnp.BAT_DAU_TYPE         AS                   "batDauType",
                     qtnp.KET_THUC             AS                   "ketThuc",
                     qtnp.KET_THUC_TYPE        AS                   "ketThucType",
                     qtnp.NGAY_DI_DUONG        AS                   "ngayDiDuong",

                     today                     AS                   "today",

                     cb.HO                     AS                   "hoCanBo",
                     cb.TEN                    AS                   "tenCanBo",
                     cb.NGAY_BAT_DAU_CONG_TAC  AS                   "ngayBatDauCongTac",

                     dmnp.MA                   AS                   "maNghiPhep",
                     dmnp.TEN                  AS                   "tenNghiPhep",
                     dmnp.SO_NGAY_PHEP         AS                   "ngayNghiPhep",

                     dv.MA                     AS                   "maDonVi",
                     dv.TEN                    AS                   "tenDonVi",
                     (SELECT DMCV.TEN
                      FROM QT_CHUC_VU QTCV
                               LEFT JOIN DM_CHUC_VU DMCV ON DMCV.MA = QTCV.MA_CHUC_VU
                      WHERE QTCV.SHCC = CB.SHCC
                        AND CHUC_VU_CHINH = 1) AS                   "tenChucVu",

                     (SELECT QTCV.MA_CHUC_VU
                      FROM QT_CHUC_VU QTCV
                      WHERE QTCV.SHCC = CB.SHCC
                        AND CHUC_VU_CHINH = 1) AS                   "maChucVu",

                     td.MA                     AS                   "maHocVi",
                     td.TEN                    AS                   "tenHocVi",

                     cdnn.MA                   AS                   "maChucDanhNgheNghiep",
                     cdnn.TEN                  AS                   "tenChucDanhNgheNghiep",
                     ROW_NUMBER() OVER (ORDER BY qtnp.BAT_DAU DESC) R
              FROM QT_NGHI_PHEP qtnp
                       LEFT JOIN TCHC_CAN_BO cb on qtnp.SHCC = cb.SHCC
                       LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
                       LEFT JOIN DM_TRINH_DO td ON (cb.HOC_VI = td.MA)
                       LEFT JOIN DM_NGACH_CDNN cdnn ON (cdnn.MA = cb.NGACH)
                       LEFT JOIN DM_NGHI_PHEP dmnp ON (qtnp.LY_DO = dmnp.MA)
              WHERE (((list_shcc IS NULL) AND (list_dv IS NULL) AND (fromYear IS NULL) AND (toYear IS NULL) AND
                      (tinhTrang IS NULL) AND (lyDo IS NULL))
                  OR (((list_shcc IS NOT NULL AND cb.SHCC IN (SELECT regexp_substr(list_shcc, '[^,]+', 1, level)
                                                              from dual
                                                              connect by regexp_substr(list_shcc, '[^,]+', 1, level) is not null))
                      OR (list_dv IS NOT NULL AND cb.MA_DON_VI IN (SELECT regexp_substr(list_dv, '[^,]+', 1, level)
                                                                   from dual
                                                                   connect by regexp_substr(list_dv, '[^,]+', 1, level) is not null))
                      OR (list_shcc IS NULL AND list_dv IS NULL))
                      AND (tinhTrang IS NULL OR
                           (qtnp.BAT_DAU <= today and qtnp.KET_THUC >= today AND tinhTrang = 2) OR
                           (qtnp.KET_THUC IS NOT NULL AND qtnp.KET_THUC < today AND tinhTrang = 1) OR
                           (qtnp.KET_THUC IS NOT NULL AND qtnp.BAT_DAU > today AND tinhTrang = 3))
                      AND (qtnp.BAT_DAU IS NOT NULL AND (fromYear IS NULL OR qtnp.BAT_DAU >= fromYear))
                      AND (qtnp.BAT_DAU IS NOT NULL AND (toYear IS NULL OR qtnp.BAT_DAU <= toYear))))
                AND (lyDo IS NULL OR (qtnp.LY_DO IN (SELECT regexp_substr(lyDo, '[^,]+', 1, level)
                                                     from dual
                                                     connect by regexp_substr(lyDo, '[^,]+', 1, level) is not null)))
                AND (searchTerm = ''
                  OR LOWER(cb.SHCC) LIKE sT
                  OR LOWER(TRIM(cb.HO || ' ' || cb.TEN)) LIKE sT
                  OR LOWER(qtnp.LY_DO_KHAC) LIKE sT
                  OR LOWER(qtnp.NOI_DEN) LIKE sT
                  OR LOWER(dmnp.TEN) LIKE sT
                  OR LOWER(qtnp.GHI_CHU) LIKE sT)
              ORDER BY qtnp.BAT_DAU DESC)
        WHERE R BETWEEN (pageNumber - 1) * pageSize + 1 AND pageNumber * pageSize;
    RETURN my_cursor;

END;

/
--EndMethod--

CREATE OR REPLACE FUNCTION QT_NGHI_THAI_SAN_DOWNLOAD_EXCEL(list_shcc IN STRING, list_dv IN STRING,
                                                fromYear IN NUMBER, toYear IN NUMBER, timeType IN NUMBER,
                                                tinhTrang IN NUMBER) RETURN SYS_REFCURSOR
AS
    my_cursor SYS_REFCURSOR;
    today     NUMBER;
BEGIN
    select (cast(sysdate as date) - cast(to_date('1970-01-01', 'YYYY-MM-DD') as date)) * 86400000 into today from dual;
    OPEN my_cursor FOR
        SELECT *
        FROM (SELECT qtnts.ID                  AS                    "id",
                     qtnts.SHCC                AS                    "shcc",
                     qtnts.NOI_DUNG            AS                    "noiDung",
                     qtnts.BAT_DAU             AS                    "batDau",
                     qtnts.BAT_DAU_TYPE        AS                    "batDauType",
                     qtnts.KET_THUC            AS                    "ketThuc",
                     qtnts.KET_THUC_TYPE       AS                    "ketThucType",
                     qtnts.TRO_LAI_CONG_TAC    AS                    "troLaiCongTac",

                     today                     AS                    "today",

                     cb.SHCC                   AS                    "maCanBo",
                     cb.HO                     AS                    "hoCanBo",
                     cb.TEN                    AS                    "tenCanBo",

                     dv.MA                     AS                    "maDonVi",
                     dv.TEN                    AS                    "tenDonVi",
                     (SELECT DMCV.TEN
                      FROM QT_CHUC_VU QTCV
                               LEFT JOIN DM_CHUC_VU DMCV ON DMCV.MA = QTCV.MA_CHUC_VU
                      WHERE QTCV.SHCC = CB.SHCC
                        AND CHUC_VU_CHINH = 1) AS                    "tenChucVu",

                     (SELECT QTCV.MA_CHUC_VU
                      FROM QT_CHUC_VU QTCV
                      WHERE QTCV.SHCC = CB.SHCC
                        AND CHUC_VU_CHINH = 1) AS                    "maChucVu",

                     td.MA                     AS                    "maHocVi",
                     td.TEN                    AS                    "tenHocVi",

                     cdnn.MA                   AS                    "maChucDanhNgheNghiep",
                     cdnn.TEN                  AS                    "tenChucDanhNgheNghiep",

                     ROW_NUMBER() OVER (ORDER BY qtnts.BAT_DAU DESC) R
              FROM QT_NGHI_THAI_SAN qtnts
                       LEFT JOIN TCHC_CAN_BO cb on qtnts.SHCC = cb.SHCC
                       LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
                       LEFT JOIN DM_TRINH_DO td ON (cb.HOC_VI = td.MA)
                       LEFT JOIN DM_NGACH_CDNN cdnn ON (cdnn.MA = cb.NGACH)
              WHERE (((list_shcc IS NULL) AND (list_dv IS NULL) AND (fromYear IS NULL) AND (toYear IS NULL) AND
                      (timeType IS NULL) AND (tinhTrang IS NULL))
                  OR (((list_shcc IS NOT NULL AND cb.SHCC IN (SELECT regexp_substr(list_shcc, '[^,]+', 1, level)
                                                              from dual
                                                              connect by regexp_substr(list_shcc, '[^,]+', 1, level) is not null))
                      OR (list_dv IS NOT NULL AND cb.MA_DON_VI IN (SELECT regexp_substr(list_dv, '[^,]+', 1, level)
                                                                   from dual
                                                                   connect by regexp_substr(list_dv, '[^,]+', 1, level) is not null))
                      OR (list_shcc IS NULL AND list_dv IS NULL))
                      AND (timeType IS NULL
                          OR (timeType = 0 AND
                              (qtnts.BAT_DAU IS NOT NULL AND (fromYear IS NULL OR qtnts.BAT_DAU >= fromYear)) AND
                              (toYear IS NULL OR qtnts.BAT_DAU <= toYear))
                          OR (timeType = 1 AND
                              (qtnts.KET_THUC IS NOT NULL AND (fromYear IS NULL OR qtnts.KET_THUC >= fromYear)) AND
                              (toYear IS NULL OR qtnts.KET_THUC <= toYear)))
                      AND (tinhTrang IS NULL OR
                           (qtnts.BAT_DAU > today AND tinhTrang = 3) OR
                           (qtnts.BAT_DAU <= today AND qtnts.KET_THUC >= today AND tinhTrang = 2) OR
                           (qtnts.KET_THUC < today AND tinhTrang = 1))))
              ORDER BY qtnts.BAT_DAU DESC);
    RETURN my_cursor;

END;

/
--EndMethod--

CREATE OR REPLACE FUNCTION QT_NGHI_THAI_SAN_GROUP_PAGE(pageNumber IN OUT NUMBER, pageSize IN OUT NUMBER,
                                            list_shcc IN STRING, list_dv IN STRING,
                                            fromYear IN NUMBER, toYear IN NUMBER, timeType IN NUMBER,
                                            tinhTrang IN NUMBER, searchTerm IN STRING,
                                            totalItem OUT NUMBER, pageTotal OUT NUMBER) RETURN SYS_REFCURSOR
AS
    my_cursor SYS_REFCURSOR;
    ST        STRING(500) := '%' || lower(searchTerm) || '%';
    today     NUMBER;
BEGIN
    select (cast(sysdate as date) - cast(to_date('1970-01-01', 'YYYY-MM-DD') as date)) * 86400000 into today from dual;
    SELECT COUNT(*)
    INTO totalItem

    FROM (SELECT *
          FROM QT_NGHI_THAI_SAN
          WHERE ID IN (SELECT MAX(ID) FROM (SELECT * FROM QT_NGHI_THAI_SAN ORDER BY SHCC DESC) GROUP BY SHCC)) qtnts
             LEFT JOIN TCHC_CAN_BO cb on qtnts.SHCC = cb.SHCC
             LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
             LEFT JOIN DM_TRINH_DO td ON (cb.HOC_VI = td.MA)
             LEFT JOIN DM_NGACH_CDNN cdnn ON (cdnn.MA = cb.NGACH);

    IF pageNumber < 1 THEN pageNumber := 1; END IF;
    IF pageSize < 1 THEN pageSize := 1; END IF;
    pageTotal := CEIL(totalItem / pageSize);
    pageNumber := LEAST(pageNumber, pageTotal);

    OPEN my_cursor FOR
        SELECT *
        FROM (SELECT qtnts.SHCC                                   AS "shcc",

                     (SELECT COUNT(*)
                      FROM QT_NGHI_THAI_SAN qtnts_temp
                               LEFT JOIN TCHC_CAN_BO cb on qtnts_temp.SHCC = cb.SHCC
                               LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
                               LEFT JOIN DM_CHUC_VU cv ON (cb.MA_CHUC_VU = cv.MA)
                               LEFT JOIN DM_TRINH_DO td ON (cb.HOC_VI = td.MA)
                               LEFT JOIN DM_NGACH_CDNN cdnn ON (cdnn.MA = cb.NGACH)
                      WHERE (qtnts_temp.SHCC = qtnts.SHCC)
                        AND (((list_shcc IS NULL) AND (list_dv IS NULL) AND (fromYear IS NULL) AND (toYear IS NULL) AND
                              (timeType IS NULL) AND (tinhTrang IS NULL))
                          OR (((list_shcc IS NOT NULL AND cb.SHCC IN (SELECT regexp_substr(list_shcc, '[^,]+', 1, level)
                                                                      from dual
                                                                      connect by regexp_substr(list_shcc, '[^,]+', 1, level) is not null))
                              OR (list_dv IS NOT NULL AND
                                  cb.MA_DON_VI IN (SELECT regexp_substr(list_dv, '[^,]+', 1, level)
                                                   from dual
                                                   connect by regexp_substr(list_dv, '[^,]+', 1, level) is not null))
                              OR (list_shcc IS NULL AND list_dv IS NULL))
                              AND (timeType IS NULL
                                  OR (timeType = 0 AND (qtnts_temp.BAT_DAU IS NOT NULL AND
                                                        (fromYear IS NULL OR qtnts_temp.BAT_DAU >= fromYear)) AND
                                      (toYear IS NULL OR qtnts_temp.BAT_DAU <= toYear))
                                  OR (timeType = 1 AND (qtnts_temp.KET_THUC IS NOT NULL AND
                                                        (fromYear IS NULL OR qtnts_temp.KET_THUC >= fromYear)) AND
                                      (toYear IS NULL OR qtnts_temp.KET_THUC <= toYear)))
                              AND (tinhTrang IS NULL OR
                                   (qtnts_temp.BAT_DAU > today AND tinhTrang = 3) OR
                                   (qtnts_temp.BAT_DAU <= today AND qtnts_temp.KET_THUC >= today AND tinhTrang = 2) OR
                                   (qtnts_temp.KET_THUC < today AND tinhTrang = 1))))
                        AND (searchTerm = ''
                          OR LOWER(cb.SHCC) LIKE ST
                          OR LOWER(TRIM(cb.HO || ' ' || cb.TEN)) LIKE ST
                          OR LOWER(qtnts_temp.NOI_DUNG) LIKE ST)) AS "soLanNghi",

                     (select rtrim(xmlagg(xmlelement(e, qtnts_temp.NOI_DUNG || ' ', '??').extract('//text()') order by
                                          null).getclobval(), '??')
                      FROM QT_NGHI_THAI_SAN qtnts_temp
                               LEFT JOIN TCHC_CAN_BO cb on qtnts_temp.SHCC = cb.SHCC
                               LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
                               LEFT JOIN DM_CHUC_VU cv ON (cb.MA_CHUC_VU = cv.MA)
                               LEFT JOIN DM_TRINH_DO td ON (cb.HOC_VI = td.MA)
                               LEFT JOIN DM_NGACH_CDNN cdnn ON (cdnn.MA = cb.NGACH)
                      WHERE (qtnts_temp.SHCC = qtnts.SHCC)
                        AND (((list_shcc IS NULL) AND (list_dv IS NULL) AND (fromYear IS NULL) AND (toYear IS NULL) AND
                              (timeType IS NULL) AND (tinhTrang IS NULL))
                          OR (((list_shcc IS NOT NULL AND cb.SHCC IN (SELECT regexp_substr(list_shcc, '[^,]+', 1, level)
                                                                      from dual
                                                                      connect by regexp_substr(list_shcc, '[^,]+', 1, level) is not null))
                              OR (list_dv IS NOT NULL AND
                                  cb.MA_DON_VI IN (SELECT regexp_substr(list_dv, '[^,]+', 1, level)
                                                   from dual
                                                   connect by regexp_substr(list_dv, '[^,]+', 1, level) is not null))
                              OR (list_shcc IS NULL AND list_dv IS NULL))
                              AND (timeType IS NULL
                                  OR (timeType = 0 AND (qtnts_temp.BAT_DAU IS NOT NULL AND
                                                        (fromYear IS NULL OR qtnts_temp.BAT_DAU >= fromYear)) AND
                                      (toYear IS NULL OR qtnts_temp.BAT_DAU <= toYear))
                                  OR (timeType = 1 AND (qtnts_temp.KET_THUC IS NOT NULL AND
                                                        (fromYear IS NULL OR qtnts_temp.KET_THUC >= fromYear)) AND
                                      (toYear IS NULL OR qtnts_temp.KET_THUC <= toYear)))
                              AND (tinhTrang IS NULL OR
                                   (qtnts_temp.BAT_DAU > today AND tinhTrang = 3) OR
                                   (qtnts_temp.BAT_DAU <= today AND qtnts_temp.KET_THUC >= today AND tinhTrang = 2) OR
                                   (qtnts_temp.KET_THUC < today AND tinhTrang = 1))))
                        AND (searchTerm = ''
                          OR LOWER(cb.SHCC) LIKE ST
                          OR LOWER(TRIM(cb.HO || ' ' || cb.TEN)) LIKE ST
                          OR LOWER(qtnts_temp.NOI_DUNG) LIKE ST)) AS "danhSachNoiDung",

                     (select rtrim(xmlagg(xmlelement(e, qtnts_temp.BAT_DAU || ' ', '??').extract('//text()') order by
                                          null).getclobval(), '??')
                      FROM QT_NGHI_THAI_SAN qtnts_temp
                               LEFT JOIN TCHC_CAN_BO cb on qtnts_temp.SHCC = cb.SHCC
                               LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
                               LEFT JOIN DM_CHUC_VU cv ON (cb.MA_CHUC_VU = cv.MA)
                               LEFT JOIN DM_TRINH_DO td ON (cb.HOC_VI = td.MA)
                               LEFT JOIN DM_NGACH_CDNN cdnn ON (cdnn.MA = cb.NGACH)
                      WHERE (qtnts_temp.SHCC = qtnts.SHCC)
                        AND (((list_shcc IS NULL) AND (list_dv IS NULL) AND (fromYear IS NULL) AND (toYear IS NULL) AND
                              (timeType IS NULL) AND (tinhTrang IS NULL))
                          OR (((list_shcc IS NOT NULL AND cb.SHCC IN (SELECT regexp_substr(list_shcc, '[^,]+', 1, level)
                                                                      from dual
                                                                      connect by regexp_substr(list_shcc, '[^,]+', 1, level) is not null))
                              OR (list_dv IS NOT NULL AND
                                  cb.MA_DON_VI IN (SELECT regexp_substr(list_dv, '[^,]+', 1, level)
                                                   from dual
                                                   connect by regexp_substr(list_dv, '[^,]+', 1, level) is not null))
                              OR (list_shcc IS NULL AND list_dv IS NULL))
                              AND (timeType IS NULL
                                  OR (timeType = 0 AND (qtnts_temp.BAT_DAU IS NOT NULL AND
                                                        (fromYear IS NULL OR qtnts_temp.BAT_DAU >= fromYear)) AND
                                      (toYear IS NULL OR qtnts_temp.BAT_DAU <= toYear))
                                  OR (timeType = 1 AND (qtnts_temp.KET_THUC IS NOT NULL AND
                                                        (fromYear IS NULL OR qtnts_temp.KET_THUC >= fromYear)) AND
                                      (toYear IS NULL OR qtnts_temp.KET_THUC <= toYear)))
                              AND (tinhTrang IS NULL OR
                                   (qtnts_temp.BAT_DAU > today AND tinhTrang = 3) OR
                                   (qtnts_temp.BAT_DAU <= today AND qtnts_temp.KET_THUC >= today AND tinhTrang = 2) OR
                                   (qtnts_temp.KET_THUC < today AND tinhTrang = 1))))
                        AND (searchTerm = ''
                          OR LOWER(cb.SHCC) LIKE ST
                          OR LOWER(TRIM(cb.HO || ' ' || cb.TEN)) LIKE ST
                          OR LOWER(qtnts_temp.NOI_DUNG) LIKE ST)) AS "danhSachBatDau",

                     (select rtrim(xmlagg(xmlelement(e, qtnts_temp.KET_THUC || ' ', '??').extract('//text()') order by
                                          null).getclobval(), '??')
                      FROM QT_NGHI_THAI_SAN qtnts_temp
                               LEFT JOIN TCHC_CAN_BO cb on qtnts_temp.SHCC = cb.SHCC
                               LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
                               LEFT JOIN DM_CHUC_VU cv ON (cb.MA_CHUC_VU = cv.MA)
                               LEFT JOIN DM_TRINH_DO td ON (cb.HOC_VI = td.MA)
                               LEFT JOIN DM_NGACH_CDNN cdnn ON (cdnn.MA = cb.NGACH)
                      WHERE (qtnts_temp.SHCC = qtnts.SHCC)
                        AND (((list_shcc IS NULL) AND (list_dv IS NULL) AND (fromYear IS NULL) AND (toYear IS NULL) AND
                              (timeType IS NULL) AND (tinhTrang IS NULL))
                          OR (((list_shcc IS NOT NULL AND cb.SHCC IN (SELECT regexp_substr(list_shcc, '[^,]+', 1, level)
                                                                      from dual
                                                                      connect by regexp_substr(list_shcc, '[^,]+', 1, level) is not null))
                              OR (list_dv IS NOT NULL AND
                                  cb.MA_DON_VI IN (SELECT regexp_substr(list_dv, '[^,]+', 1, level)
                                                   from dual
                                                   connect by regexp_substr(list_dv, '[^,]+', 1, level) is not null))
                              OR (list_shcc IS NULL AND list_dv IS NULL))
                              AND (timeType IS NULL
                                  OR (timeType = 0 AND (qtnts_temp.BAT_DAU IS NOT NULL AND
                                                        (fromYear IS NULL OR qtnts_temp.BAT_DAU >= fromYear)) AND
                                      (toYear IS NULL OR qtnts_temp.BAT_DAU <= toYear))
                                  OR (timeType = 1 AND (qtnts_temp.KET_THUC IS NOT NULL AND
                                                        (fromYear IS NULL OR qtnts_temp.KET_THUC >= fromYear)) AND
                                      (toYear IS NULL OR qtnts_temp.KET_THUC <= toYear)))
                              AND (tinhTrang IS NULL OR
                                   (qtnts_temp.BAT_DAU > today AND tinhTrang = 3) OR
                                   (qtnts_temp.BAT_DAU <= today AND qtnts_temp.KET_THUC >= today AND tinhTrang = 2) OR
                                   (qtnts_temp.KET_THUC < today AND tinhTrang = 1))))
                        AND (searchTerm = ''
                          OR LOWER(cb.SHCC) LIKE ST
                          OR LOWER(TRIM(cb.HO || ' ' || cb.TEN)) LIKE ST
                          OR LOWER(qtnts_temp.NOI_DUNG) LIKE ST)) AS "danhSachKetThuc",

                     (select rtrim(xmlagg(xmlelement(e, qtnts_temp.KET_THUC_TYPE || ' ', '??').extract('//text()') order
                                          by null).getclobval(), '??')
                      FROM QT_NGHI_THAI_SAN qtnts_temp
                               LEFT JOIN TCHC_CAN_BO cb on qtnts_temp.SHCC = cb.SHCC
                               LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
                               LEFT JOIN DM_CHUC_VU cv ON (cb.MA_CHUC_VU = cv.MA)
                               LEFT JOIN DM_TRINH_DO td ON (cb.HOC_VI = td.MA)
                               LEFT JOIN DM_NGACH_CDNN cdnn ON (cdnn.MA = cb.NGACH)
                      WHERE (qtnts_temp.SHCC = qtnts.SHCC)
                        AND (((list_shcc IS NULL) AND (list_dv IS NULL) AND (fromYear IS NULL) AND (toYear IS NULL) AND
                              (timeType IS NULL) AND (tinhTrang IS NULL))
                          OR (((list_shcc IS NOT NULL AND cb.SHCC IN (SELECT regexp_substr(list_shcc, '[^,]+', 1, level)
                                                                      from dual
                                                                      connect by regexp_substr(list_shcc, '[^,]+', 1, level) is not null))
                              OR (list_dv IS NOT NULL AND
                                  cb.MA_DON_VI IN (SELECT regexp_substr(list_dv, '[^,]+', 1, level)
                                                   from dual
                                                   connect by regexp_substr(list_dv, '[^,]+', 1, level) is not null))
                              OR (list_shcc IS NULL AND list_dv IS NULL))
                              AND (timeType IS NULL
                                  OR (timeType = 0 AND (qtnts_temp.BAT_DAU IS NOT NULL AND
                                                        (fromYear IS NULL OR qtnts_temp.BAT_DAU >= fromYear)) AND
                                      (toYear IS NULL OR qtnts_temp.BAT_DAU <= toYear))
                                  OR (timeType = 1 AND (qtnts_temp.KET_THUC IS NOT NULL AND
                                                        (fromYear IS NULL OR qtnts_temp.KET_THUC >= fromYear)) AND
                                      (toYear IS NULL OR qtnts_temp.KET_THUC <= toYear)))
                              AND (tinhTrang IS NULL OR
                                   (qtnts_temp.BAT_DAU > today AND tinhTrang = 3) OR
                                   (qtnts_temp.BAT_DAU <= today AND qtnts_temp.KET_THUC >= today AND tinhTrang = 2) OR
                                   (qtnts_temp.KET_THUC < today AND tinhTrang = 1))))
                        AND (searchTerm = ''
                          OR LOWER(cb.SHCC) LIKE ST
                          OR LOWER(TRIM(cb.HO || ' ' || cb.TEN)) LIKE ST
                          OR LOWER(qtnts_temp.NOI_DUNG) LIKE ST)) AS "danhSachKetThucType",

                     (select rtrim(xmlagg(xmlelement(e, qtnts_temp.BAT_DAU_TYPE || ' ', '??').extract('//text()') order
                                          by null).getclobval(), '??')
                      FROM QT_NGHI_THAI_SAN qtnts_temp
                               LEFT JOIN TCHC_CAN_BO cb on qtnts_temp.SHCC = cb.SHCC
                               LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
                               LEFT JOIN DM_CHUC_VU cv ON (cb.MA_CHUC_VU = cv.MA)
                               LEFT JOIN DM_TRINH_DO td ON (cb.HOC_VI = td.MA)
                               LEFT JOIN DM_NGACH_CDNN cdnn ON (cdnn.MA = cb.NGACH)
                      WHERE (qtnts_temp.SHCC = qtnts.SHCC)
                        AND (((list_shcc IS NULL) AND (list_dv IS NULL) AND (fromYear IS NULL) AND (toYear IS NULL) AND
                              (timeType IS NULL) AND (tinhTrang IS NULL))
                          OR (((list_shcc IS NOT NULL AND cb.SHCC IN (SELECT regexp_substr(list_shcc, '[^,]+', 1, level)
                                                                      from dual
                                                                      connect by regexp_substr(list_shcc, '[^,]+', 1, level) is not null))
                              OR (list_dv IS NOT NULL AND
                                  cb.MA_DON_VI IN (SELECT regexp_substr(list_dv, '[^,]+', 1, level)
                                                   from dual
                                                   connect by regexp_substr(list_dv, '[^,]+', 1, level) is not null))
                              OR (list_shcc IS NULL AND list_dv IS NULL))
                              AND (timeType IS NULL
                                  OR (timeType = 0 AND (qtnts_temp.BAT_DAU IS NOT NULL AND
                                                        (fromYear IS NULL OR qtnts_temp.BAT_DAU >= fromYear)) AND
                                      (toYear IS NULL OR qtnts_temp.BAT_DAU <= toYear))
                                  OR (timeType = 1 AND (qtnts_temp.KET_THUC IS NOT NULL AND
                                                        (fromYear IS NULL OR qtnts_temp.KET_THUC >= fromYear)) AND
                                      (toYear IS NULL OR qtnts_temp.KET_THUC <= toYear)))
                              AND (tinhTrang IS NULL OR
                                   (qtnts_temp.BAT_DAU > today AND tinhTrang = 3) OR
                                   (qtnts_temp.BAT_DAU <= today AND qtnts_temp.KET_THUC >= today AND tinhTrang = 2) OR
                                   (qtnts_temp.KET_THUC < today AND tinhTrang = 1))))
                        AND (searchTerm = ''
                          OR LOWER(cb.SHCC) LIKE ST
                          OR LOWER(TRIM(cb.HO || ' ' || cb.TEN)) LIKE ST
                          OR LOWER(qtnts_temp.NOI_DUNG) LIKE ST)) AS "danhSachBatDauType",

                     today                                        AS "today",

                     cb.SHCC                                      AS "maCanBo",
                     cb.HO                                        AS "hoCanBo",
                     cb.TEN                                       AS "tenCanBo",

                     dv.MA                                        AS "maDonVi",
                     dv.TEN                                       AS "tenDonVi",

                     (SELECT DMCV.TEN
                      FROM QT_CHUC_VU QTCV
                               LEFT JOIN DM_CHUC_VU DMCV ON DMCV.MA = QTCV.MA_CHUC_VU
                      WHERE QTCV.SHCC = CB.SHCC
                        AND CHUC_VU_CHINH = 1)                    AS "tenChucVu",

                     (SELECT QTCV.MA_CHUC_VU
                      FROM QT_CHUC_VU QTCV
                      WHERE QTCV.SHCC = CB.SHCC
                        AND CHUC_VU_CHINH = 1)                    AS "maChucVu",
                     td.MA                                        AS "maHocVi",
                     td.TEN                                       AS "tenHocVi",

                     cdnn.MA                                      AS "maChucDanhNgheNghiep",
                     cdnn.TEN                                     AS "tenChucDanhNgheNghiep",

                     ROW_NUMBER() OVER (ORDER BY qtnts.BAT_DAU DESC) R
              FROM (SELECT *
                    FROM QT_NGHI_THAI_SAN
                    WHERE ID IN
                          (SELECT MAX(ID) FROM (SELECT * FROM QT_NGHI_THAI_SAN ORDER BY SHCC DESC) GROUP BY SHCC)) qtnts
                       LEFT JOIN TCHC_CAN_BO cb on qtnts.SHCC = cb.SHCC
                       LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
                       LEFT JOIN DM_TRINH_DO td ON (cb.HOC_VI = td.MA)
                       LEFT JOIN DM_NGACH_CDNN cdnn ON (cdnn.MA = cb.NGACH)
              ORDER BY qtnts.BAT_DAU DESC)
        WHERE R BETWEEN (pageNumber - 1) * pageSize + 1 AND pageNumber * pageSize;
    RETURN my_cursor;

END;

/
--EndMethod--

CREATE OR REPLACE FUNCTION QT_NGHI_THAI_SAN_SEARCH_PAGE(pageNumber IN OUT NUMBER, pageSize IN OUT NUMBER,
                                             list_shcc IN STRING, list_dv IN STRING,
                                             fromYear IN NUMBER, toYear IN NUMBER, timeType IN NUMBER,
                                             tinhTrang IN NUMBER, searchTerm IN STRING,
                                             totalItem OUT NUMBER, pageTotal OUT NUMBER) RETURN SYS_REFCURSOR
AS
    my_cursor SYS_REFCURSOR;
    sT        STRING(500) := '%' || lower(searchTerm) || '%';
    today     NUMBER;
BEGIN
    select (cast(sysdate as date) - cast(to_date('1970-01-01', 'YYYY-MM-DD') as date)) * 86400000 into today from dual;
    SELECT COUNT(*)
    INTO totalItem

    FROM QT_NGHI_THAI_SAN qtnts
             LEFT JOIN TCHC_CAN_BO cb on qtnts.SHCC = cb.SHCC
             LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
             LEFT JOIN DM_TRINH_DO td ON (cb.HOC_VI = td.MA)
             LEFT JOIN DM_NGACH_CDNN cdnn ON (cdnn.MA = cb.NGACH)
    WHERE (((list_shcc IS NULL) AND (list_dv IS NULL) AND (fromYear IS NULL) AND (toYear IS NULL) AND
            (timeType IS NULL) AND (tinhTrang IS NULL))
        OR (((list_shcc IS NOT NULL AND cb.SHCC IN (SELECT regexp_substr(list_shcc, '[^,]+', 1, level)
                                                    from dual
                                                    connect by regexp_substr(list_shcc, '[^,]+', 1, level) is not null))
            OR (list_dv IS NOT NULL AND cb.MA_DON_VI IN (SELECT regexp_substr(list_dv, '[^,]+', 1, level)
                                                         from dual
                                                         connect by regexp_substr(list_dv, '[^,]+', 1, level) is not null))
            OR (list_shcc IS NULL AND list_dv IS NULL))
            AND (timeType IS NULL
                OR (timeType = 0 AND (qtnts.BAT_DAU IS NOT NULL AND (fromYear IS NULL OR qtnts.BAT_DAU >= fromYear)) AND
                    (toYear IS NULL OR qtnts.BAT_DAU <= toYear))
                OR
                 (timeType = 1 AND (qtnts.KET_THUC IS NOT NULL AND (fromYear IS NULL OR qtnts.KET_THUC >= fromYear)) AND
                  (toYear IS NULL OR qtnts.KET_THUC <= toYear)))
            AND (tinhTrang IS NULL OR
                 (qtnts.BAT_DAU > today AND tinhTrang = 3) OR
                 (qtnts.BAT_DAU <= today AND qtnts.KET_THUC >= today AND tinhTrang = 2) OR
                 (qtnts.KET_THUC < today AND tinhTrang = 1))))
      AND (searchTerm = ''
        OR LOWER(cb.SHCC) LIKE ST
        OR LOWER(TRIM(cb.HO || ' ' || cb.TEN)) LIKE ST
        OR LOWER(qtnts.NOI_DUNG) LIKE ST);

    IF pageNumber < 1 THEN pageNumber := 1; END IF;
    IF pageSize < 1 THEN pageSize := 1; END IF;
    pageTotal := CEIL(totalItem / pageSize);
    pageNumber := LEAST(pageNumber, pageTotal);

    OPEN my_cursor FOR
        SELECT *
        FROM (SELECT qtnts.ID                  AS                    "id",
                     qtnts.SHCC                AS                    "shcc",
                     qtnts.NOI_DUNG            AS                    "noiDung",
                     qtnts.BAT_DAU             AS                    "batDau",
                     qtnts.BAT_DAU_TYPE        AS                    "batDauType",
                     qtnts.KET_THUC            AS                    "ketThuc",
                     qtnts.KET_THUC_TYPE       AS                    "ketThucType",
                     qtnts.TRO_LAI_CONG_TAC    AS                    "troLaiCongTac",

                     today                     AS                    "today",

                     cb.SHCC                   AS                    "maCanBo",
                     cb.HO                     AS                    "hoCanBo",
                     cb.TEN                    AS                    "tenCanBo",

                     dv.MA                     AS                    "maDonVi",
                     dv.TEN                    AS                    "tenDonVi",

                     (SELECT DMCV.TEN
                      FROM QT_CHUC_VU QTCV
                               LEFT JOIN DM_CHUC_VU DMCV ON DMCV.MA = QTCV.MA_CHUC_VU
                      WHERE QTCV.SHCC = CB.SHCC
                        AND CHUC_VU_CHINH = 1) AS                    "tenChucVu",

                     (SELECT QTCV.MA_CHUC_VU
                      FROM QT_CHUC_VU QTCV
                      WHERE QTCV.SHCC = CB.SHCC
                        AND CHUC_VU_CHINH = 1) AS                    "maChucVu",
                     td.MA                     AS                    "maHocVi",
                     td.TEN                    AS                    "tenHocVi",

                     cdnn.MA                   AS                    "maChucDanhNgheNghiep",
                     cdnn.TEN                  AS                    "tenChucDanhNgheNghiep",

                     ROW_NUMBER() OVER (ORDER BY qtnts.BAT_DAU DESC) R
              FROM QT_NGHI_THAI_SAN qtnts
                       LEFT JOIN TCHC_CAN_BO cb on qtnts.SHCC = cb.SHCC
                       LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
                       LEFT JOIN DM_TRINH_DO td ON (cb.HOC_VI = td.MA)
                       LEFT JOIN DM_NGACH_CDNN cdnn ON (cdnn.MA = cb.NGACH)
              WHERE (((list_shcc IS NULL) AND (list_dv IS NULL) AND (fromYear IS NULL) AND (toYear IS NULL) AND
                      (timeType IS NULL) AND (tinhTrang IS NULL))
                  OR (((list_shcc IS NOT NULL AND cb.SHCC IN (SELECT regexp_substr(list_shcc, '[^,]+', 1, level)
                                                              from dual
                                                              connect by regexp_substr(list_shcc, '[^,]+', 1, level) is not null))
                      OR (list_dv IS NOT NULL AND cb.MA_DON_VI IN (SELECT regexp_substr(list_dv, '[^,]+', 1, level)
                                                                   from dual
                                                                   connect by regexp_substr(list_dv, '[^,]+', 1, level) is not null))
                      OR (list_shcc IS NULL AND list_dv IS NULL))
                      AND (timeType IS NULL
                          OR (timeType = 0 AND
                              (qtnts.BAT_DAU IS NOT NULL AND (fromYear IS NULL OR qtnts.BAT_DAU >= fromYear)) AND
                              (toYear IS NULL OR qtnts.BAT_DAU <= toYear))
                          OR (timeType = 1 AND
                              (qtnts.KET_THUC IS NOT NULL AND (fromYear IS NULL OR qtnts.KET_THUC >= fromYear)) AND
                              (toYear IS NULL OR qtnts.KET_THUC <= toYear)))
                      AND (tinhTrang IS NULL OR
                           (qtnts.BAT_DAU > today AND tinhTrang = 3) OR
                           (qtnts.BAT_DAU <= today AND qtnts.KET_THUC >= today AND tinhTrang = 2) OR
                           (qtnts.KET_THUC < today AND tinhTrang = 1))))
                AND (searchTerm = ''
                  OR LOWER(cb.SHCC) LIKE ST
                  OR LOWER(TRIM(cb.HO || ' ' || cb.TEN)) LIKE ST
                  OR LOWER(qtnts.NOI_DUNG) LIKE ST)
              ORDER BY qtnts.BAT_DAU DESC)
        WHERE R BETWEEN (pageNumber - 1) * pageSize + 1 AND pageNumber * pageSize;
    RETURN my_cursor;

END;

/
--EndMethod--

CREATE OR REPLACE FUNCTION QT_NGHI_VIEC_DOWNLOAD_EXCEL(filter IN STRING) RETURN SYS_REFCURSOR
AS
    my_cursor SYS_REFCURSOR;
    listShcc  STRING(200);
    listDonVi STRING(100);
    fromYear  NUMBER(20);
    toYear    NUMBER(20);
    listLyDo  STRING(100);
BEGIN
    SELECT JSON_VALUE(filter, '$.listShcc') INTO listShcc FROM DUAL;
    SELECT JSON_VALUE(filter, '$.listDonVi') INTO listDonVi FROM DUAL;
    SELECT JSON_VALUE(filter, '$.fromYear' RETURNING NUMBER) INTO fromYear FROM DUAL;
    SELECT JSON_VALUE(filter, '$.toYear' RETURNING NUMBER) INTO toYear FROM DUAL;
    SELECT JSON_VALUE(filter, '$.listLyDo') INTO listLyDo FROM DUAL;
    OPEN my_cursor FOR
        SELECT *
        FROM (SELECT qtnv.MA                   AS                     "ma",
                     qtnv.HO_TEN               AS                     "hoTen",
                     qtnv.SHCC                 AS                     "shcc",
                     qtnv.NGAY_NGHI            AS                     "ngayNghi",
                     qtnv.SO_QUYET_DINH        AS                     "soQuyetDinh",
                     qtnv.NOI_DUNG             AS                     "noiDung",
                     qtnv.GHI_CHU              AS                     "ghiChu",
                     qtnv.DIEN_NGHI            AS                     "dienNghi",

                     cb.HO                     AS                     "hoCanBo",
                     cb.TEN                    AS                     "tenCanBo",

                     dv.MA                     AS                     "maDonVi",
                     dv.TEN                    AS                     "tenDonVi",
                     (SELECT DMCV.TEN
                      FROM QT_CHUC_VU QTCV
                               LEFT JOIN DM_CHUC_VU DMCV ON DMCV.MA = QTCV.MA_CHUC_VU
                      WHERE QTCV.SHCC = CB.SHCC
                        AND CHUC_VU_CHINH = 1) AS                     "tenChucVu",

                     (SELECT QTCV.MA_CHUC_VU
                      FROM QT_CHUC_VU QTCV
                      WHERE QTCV.SHCC = CB.SHCC
                        AND CHUC_VU_CHINH = 1) AS                     "maChucVu",
                     td.MA                     AS                     "maHocVi",
                     td.TEN                    AS                     "tenHocVi",

                     nv.TEN                    as                     "tenLyDo",
                     qtnv.LY_DO_NGHI           AS                     "lyDoNghi",
                     cdnn.MA                   AS                     "maChucDanhNgheNghiep",
                     cdnn.TEN                  AS                     "tenChucDanhNgheNghiep",
                     ROW_NUMBER() OVER (ORDER BY qtnv.NGAY_NGHI DESC) R
              FROM QT_NGHI_VIEC qtnv
                       LEFT JOIN TCHC_CAN_BO cb on qtnv.SHCC = cb.SHCC
                       LEFT JOIN DM_NGHI_VIEC nv on nv.MA = qtnv.LY_DO_NGHI
                       LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
                       LEFT JOIN DM_TRINH_DO td ON (cb.HOC_VI = td.MA)
                       LEFT JOIN DM_NGACH_CDNN cdnn ON (cdnn.MA = cb.NGACH)
              WHERE ((fromYear IS NULL OR fromYear = 0 OR
                      (qtnv.NGAY_NGHI IS NOT NULL AND qtnv.NGAY_NGHI >= fromYear)) AND
                     (toYear IS NULL OR toYear = 0 OR
                      (qtnv.NGAY_NGHI IS NOT NULL AND qtnv.NGAY_NGHI <= toYear + 86399999)))
                AND (listLyDo IS NULL OR
                     (listLyDo IS NOT NULL AND qtnv.LY_DO_NGHI IN (SELECT regexp_substr(listLyDo, '[^,]+', 1, level)
                                                                   from dual
                                                                   connect by regexp_substr(listLyDo, '[^,]+', 1, level) is not null)))
                AND (listShcc IS NULL OR
                     (listShcc IS NOT NULL AND qtnv.SHCC IN (SELECT regexp_substr(listShcc, '[^,]+', 1, level)
                                                             from dual
                                                             connect by regexp_substr(listShcc, '[^,]+', 1, level) is not null)))
                AND (listDonVi IS NULL OR
                     (listDonVi IS NOT NULL AND cb.MA_DON_VI IN (SELECT regexp_substr(listDonVi, '[^,]+', 1, level)
                                                                 from dual
                                                                 connect by regexp_substr(listDonVi, '[^,]+', 1, level) is not null)))

              ORDER BY qtnv.NGAY_NGHI DESC NULLS LAST, qtnv.SO_QUYET_DINH NULLS LAST, qtnv.SHCC NULLS LAST,
                       cb.HO NULLS LAST);
    RETURN my_cursor;

END;

/
--EndMethod--

CREATE OR REPLACE FUNCTION QT_NGHI_VIEC_SEARCH_PAGE(pageNumber IN OUT NUMBER, pageSize IN OUT NUMBER,
                                         filter IN STRING, searchTerm IN STRING,
                                         totalItem OUT NUMBER, pageTotal OUT NUMBER) RETURN SYS_REFCURSOR
AS
    my_cursor SYS_REFCURSOR;
    sT        STRING(500) := '%' || lower(searchTerm) || '%';
    listShcc  STRING(200);
    listDonVi STRING(100);
    fromYear  NUMBER(20);
    toYear    NUMBER(20);
    listLyDo  STRING(100);
BEGIN
    SELECT JSON_VALUE(filter, '$.listShcc') INTO listShcc FROM DUAL;
    SELECT JSON_VALUE(filter, '$.listDonVi') INTO listDonVi FROM DUAL;
    SELECT JSON_VALUE(filter, '$.fromYear' RETURNING NUMBER) INTO fromYear FROM DUAL;
    SELECT JSON_VALUE(filter, '$.toYear' RETURNING NUMBER) INTO toYear FROM DUAL;
    SELECT JSON_VALUE(filter, '$.listLyDo') INTO listLyDo FROM DUAL;

    SELECT COUNT(*)
    INTO totalItem

    FROM QT_NGHI_VIEC qtnv
             LEFT JOIN TCHC_CAN_BO cb on qtnv.SHCC = cb.SHCC
             LEFT JOIN DM_NGHI_VIEC nv on nv.MA = qtnv.LY_DO_NGHI
             LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
             LEFT JOIN DM_TRINH_DO td ON (cb.HOC_VI = td.MA)
             LEFT JOIN DM_NGACH_CDNN cdnn ON (cdnn.MA = cb.NGACH)
    WHERE ((fromYear IS NULL OR fromYear = 0 OR (qtnv.NGAY_NGHI IS NOT NULL AND qtnv.NGAY_NGHI >= fromYear)) AND
           (toYear IS NULL OR toYear = 0 OR (qtnv.NGAY_NGHI IS NOT NULL AND qtnv.NGAY_NGHI <= toYear + 86399999)))
      AND (listLyDo IS NULL OR
           (listLyDo IS NOT NULL AND qtnv.LY_DO_NGHI IN (SELECT regexp_substr(listLyDo, '[^,]+', 1, level)
                                                         from dual
                                                         connect by regexp_substr(listLyDo, '[^,]+', 1, level) is not null)))
      AND (listShcc IS NULL OR
           (listShcc IS NOT NULL AND qtnv.SHCC IN (SELECT regexp_substr(listShcc, '[^,]+', 1, level)
                                                   from dual
                                                   connect by regexp_substr(listShcc, '[^,]+', 1, level) is not null)))
      AND (listDonVi IS NULL OR
           (listDonVi IS NOT NULL AND cb.MA_DON_VI IN (SELECT regexp_substr(listDonVi, '[^,]+', 1, level)
                                                       from dual
                                                       connect by regexp_substr(listDonVi, '[^,]+', 1, level) is not null)))
      AND (searchTerm = ''
        OR LOWER(cb.SHCC) LIKE ST
        OR LOWER(TRIM(cb.HO || ' ' || cb.TEN)) LIKE ST
        OR LOWER(qtnv.HO_TEN) LIKE sT
        OR LOWER(qtnv.NOI_DUNG) LIKE sT
        OR LOWER(qtnv.SO_QUYET_DINH) LIKE sT);

    IF pageNumber < 1 THEN pageNumber := 1; END IF;
    IF pageSize < 1 THEN pageSize := 1; END IF;
    pageTotal := CEIL(totalItem / pageSize);
    pageNumber := LEAST(pageNumber, pageTotal);

    OPEN my_cursor FOR
        SELECT *
        FROM (SELECT qtnv.MA            AS                            "ma",
                     qtnv.HO_TEN        AS                            "hoTen",
                     qtnv.SHCC          AS                            "shcc",
                     qtnv.NGAY_NGHI     AS                            "ngayNghi",
                     qtnv.SO_QUYET_DINH AS                            "soQuyetDinh",
                     qtnv.NOI_DUNG      AS                            "noiDung",
                     qtnv.GHI_CHU       AS                            "ghiChu",
                     qtnv.DIEN_NGHI     AS                            "dienNghi",

                     cb.HO              AS                            "hoCanBo",
                     cb.TEN             AS                            "tenCanBo",

                     dv.MA              AS                            "maDonVi",
                     dv.TEN             AS                            "tenDonVi",
                      (SELECT DMCV.TEN
                      FROM QT_CHUC_VU QTCV
                               LEFT JOIN DM_CHUC_VU DMCV ON DMCV.MA = QTCV.MA_CHUC_VU
                      WHERE QTCV.SHCC = CB.SHCC
                        AND CHUC_VU_CHINH = 1)                        AS "tenChucVu",

                     (SELECT QTCV.MA_CHUC_VU
                      FROM QT_CHUC_VU QTCV
                      WHERE QTCV.SHCC = CB.SHCC
                        AND CHUC_VU_CHINH = 1)                        AS "maChucVu",
                     td.MA              AS                            "maHocVi",
                     td.TEN             AS                            "tenHocVi",

                     nv.TEN             as                            "tenLyDo",
                     qtnv.LY_DO_NGHI    AS                            "lyDoNghi",
                     cdnn.MA            AS                            "maChucDanhNgheNghiep",
                     cdnn.TEN           AS                            "tenChucDanhNgheNghiep",
                     ROW_NUMBER() OVER (ORDER BY qtnv.NGAY_NGHI DESC) R
              FROM QT_NGHI_VIEC qtnv
                       LEFT JOIN TCHC_CAN_BO cb on qtnv.SHCC = cb.SHCC
                       LEFT JOIN DM_NGHI_VIEC nv on nv.MA = qtnv.LY_DO_NGHI
                       LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
                       LEFT JOIN DM_TRINH_DO td ON (cb.HOC_VI = td.MA)
                       LEFT JOIN DM_NGACH_CDNN cdnn ON (cdnn.MA = cb.NGACH)
              WHERE ((fromYear IS NULL OR fromYear = 0 OR
                      (qtnv.NGAY_NGHI IS NOT NULL AND qtnv.NGAY_NGHI >= fromYear)) AND
                     (toYear IS NULL OR toYear = 0 OR
                      (qtnv.NGAY_NGHI IS NOT NULL AND qtnv.NGAY_NGHI <= toYear + 86399999)))
                AND (listLyDo IS NULL OR
                     (listLyDo IS NOT NULL AND qtnv.LY_DO_NGHI IN (SELECT regexp_substr(listLyDo, '[^,]+', 1, level)
                                                                   from dual
                                                                   connect by regexp_substr(listLyDo, '[^,]+', 1, level) is not null)))
                AND (listShcc IS NULL OR
                     (listShcc IS NOT NULL AND qtnv.SHCC IN (SELECT regexp_substr(listShcc, '[^,]+', 1, level)
                                                             from dual
                                                             connect by regexp_substr(listShcc, '[^,]+', 1, level) is not null)))
                AND (listDonVi IS NULL OR
                     (listDonVi IS NOT NULL AND cb.MA_DON_VI IN (SELECT regexp_substr(listDonVi, '[^,]+', 1, level)
                                                                 from dual
                                                                 connect by regexp_substr(listDonVi, '[^,]+', 1, level) is not null)))
                AND (searchTerm = ''
                  OR LOWER(cb.SHCC) LIKE ST
                  OR LOWER(TRIM(cb.HO || ' ' || cb.TEN)) LIKE ST
                  OR LOWER(qtnv.HO_TEN) LIKE sT
                  OR LOWER(qtnv.NOI_DUNG) LIKE sT
                  OR LOWER(qtnv.SO_QUYET_DINH) LIKE sT)
              ORDER BY qtnv.NGAY_NGHI DESC NULLS LAST , qtnv.SO_QUYET_DINH NULLS LAST, qtnv.SHCC NULLS LAST, cb.HO NULLS LAST)
        WHERE R BETWEEN (pageNumber - 1) * pageSize + 1 AND pageNumber * pageSize;
    RETURN my_cursor;

END;

/
--EndMethod--

CREATE OR REPLACE FUNCTION QT_SANG_KIEN_DOWNLOAD_EXCEL(filter IN STRING,
                                            searchTerm IN STRING) RETURN SYS_REFCURSOR
AS
    /* Object */------------------------------------------------------------------------------------------
    my_cursor SYS_REFCURSOR;

    /* Search term */-------------------------------------------------------------------------------------
    sT        STRING(500) := '%' || lower(searchTerm) || '%';

    /* List params in filter*/----------------------------------------------------------------------------
    listDonVi STRING(100);
    listShcc  STRING(100);
BEGIN

    /* Init filter */-------------------------------------------------------------------------------------
    SELECT JSON_VALUE(filter, '$.listDonVi') INTO listDonVi FROM DUAL;
    SELECT JSON_VALUE(filter, '$.listShcc') INTO listShcc FROM DUAL;

    OPEN my_cursor FOR
        /* GET nameTable.COLUMN                AS   "key" */-------------------------------------------------------
        SELECT qtsk.ID                        AS   "id",
               qtsk.SHCC                      AS   "shcc",
               qtsk.MA_SO                     AS   "maSo",
               qtsk.TEN_SANG_KIEN             AS   "tenSangKien",
               qtsk.SO_QUYET_DINH             AS   "soQuyetDinh",
               qtsk.CAP_ANH_HUONG             AS   "capAnhHuong",

               cb.HO                          AS   "hoCanBo",
               cb.TEN                         AS   "tenCanBo",

               (select dmcv.TEN
                from QT_CHUC_VU qtcv
                         left join DM_CHUC_VU dmcv on qtcv.MA_CHUC_VU = dmcv.MA
                where qtcv.shcc = qtsk.SHCC
                  and qtcv.CHUC_VU_CHINH = 1) as   "tenChucVu",
               (select dmdv.TEN
                from QT_CHUC_VU qtcv
                         left join DM_DON_VI dmdv on qtcv.MA_DON_VI = dmdv.MA
                where qtcv.shcc = qtsk.SHCC
                  and qtcv.CHUC_VU_CHINH = 1) as   "tenDonVi",
               (select dmbm.TEN
                from QT_CHUC_VU qtcv
                         left join DM_BO_MON dmbm on qtcv.MA_BO_MON = dmbm.MA
                where qtcv.shcc = qtsk.SHCC
                  and qtcv.CHUC_VU_CHINH = 1) as   "tenBoMon",

               td.MA                          AS   "maHocVi",
               td.TEN                         AS   "tenHocVi",

               cdnn.MA                        AS   "maChucDanhNgheNghiep",
               cdnn.TEN                       AS   "tenChucDanhNgheNghiep"

            /*  Data Field */
        FROM QT_SANG_KIEN qtsk
                 LEFT JOIN TCHC_CAN_BO cb on qtsk.SHCC = cb.SHCC
                 LEFT JOIN DM_TRINH_DO td ON (cb.HOC_VI = td.MA)
                 LEFT JOIN DM_NGACH_CDNN cdnn ON (cdnn.MA = cb.NGACH)
        WHERE ((listShcc IS NOT NULL AND cb.SHCC IN (SELECT regexp_substr(listShcc, '[^,]+', 1, level)
                                                     from dual
                                                     connect by regexp_substr(listShcc, '[^,]+', 1, level) is not null))
            OR (listDonVi IS NOT NULL AND cb.MA_DON_VI IN (SELECT regexp_substr(listDonVi, '[^,]+', 1, level)
                                                           from dual
                                                           connect by regexp_substr(listDonVi, '[^,]+', 1, level) is not null))
            OR (listShcc IS NULL AND listDonVi IS NULL))
          AND (searchTerm = ''
            OR LOWER(cb.SHCC) LIKE sT
            OR LOWER(TRIM(cb.HO || ' ' || cb.TEN)) LIKE sT
            OR LOWER(qtsk.MA_SO) LIKE sT
            OR LOWER(qtsk.TEN_SANG_KIEN) LIKE sT)
            /* End Data Field */

        ORDER BY cb.TEN;
    RETURN my_cursor;

END;

/
--EndMethod--

CREATE OR REPLACE FUNCTION QT_SANG_KIEN_SEARCH_PAGE(pageNumber IN OUT NUMBER, pageSize IN OUT NUMBER,
--                                          listShcc IN STRING, listDonVi IN STRING,
                                         filter IN STRING,
                                         searchTerm IN STRING,
                                         totalItem OUT NUMBER, pageTotal OUT NUMBER) RETURN SYS_REFCURSOR
AS
    /* Object */------------------------------------------------------------------------------------------
    my_cursor SYS_REFCURSOR;

    /* Search term */-------------------------------------------------------------------------------------
    sT        STRING(500) := '%' || lower(searchTerm) || '%';

    /* List params in filter*/----------------------------------------------------------------------------
    listDonVi STRING(100);
    listShcc  STRING(100);
    filterCapAnhHuong NUMBER(10);
BEGIN

    /* Init filter */-------------------------------------------------------------------------------------
    SELECT JSON_VALUE(filter, '$.listDonVi') INTO listDonVi FROM DUAL;
    SELECT JSON_VALUE(filter, '$.listShcc') INTO listShcc FROM DUAL;
    SELECT JSON_VALUE(filter, '$.filterCapAnhHuong') INTO filterCapAnhHuong FROM DUAL;

    /* Init pageSize, pageNumber */---------------------------------------------------------------
    SELECT COUNT(*)
    INTO totalItem

    /* Data Field: Get data with filter & search term  */ ---------------------------------------------------------------

    -- 1. Map
    FROM QT_SANG_KIEN qtsk
             LEFT JOIN TCHC_CAN_BO cb on qtsk.SHCC = cb.SHCC
             LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
             LEFT JOIN DM_CHUC_VU cv ON (cb.MA_CHUC_VU = cv.MA)
             LEFT JOIN DM_TRINH_DO td ON (cb.HOC_VI = td.MA)
             LEFT JOIN DM_NGACH_CDNN cdnn ON (cdnn.MA = cb.NGACH)

    -- 2. Conditions (filter + searchTerm)
    WHERE ((listShcc IS NOT NULL AND cb.SHCC IN (SELECT regexp_substr(listShcc, '[^,]+', 1, level)
                                                 from dual
                                                 connect by regexp_substr(listShcc, '[^,]+', 1, level) is not null))
        OR (listDonVi IS NOT NULL AND cb.MA_DON_VI IN (SELECT regexp_substr(listDonVi, '[^,]+', 1, level)
                                                       from dual
                                                       connect by regexp_substr(listDonVi, '[^,]+', 1, level) is not null))
        OR (filterCapAnhHuong IS NOT NULL AND qtsk.CAP_ANH_HUONG = filterCapAnhHuong)
        OR (listShcc IS NULL AND listDonVi IS NULL AND filterCapAnhHuong IS NULL))
      AND (searchTerm = ''
        OR LOWER(cb.SHCC) LIKE sT
        OR LOWER(TRIM(cb.HO || ' ' || cb.TEN)) LIKE sT
        OR LOWER(qtsk.MA_SO) LIKE sT
        OR LOWER(qtsk.TEN_SANG_KIEN) LIKE sT);
    /* End Data Field */ ---------------------------------------------------------------

    IF pageNumber < 1 THEN pageNumber := 1; END IF;
    IF pageSize < 1 THEN pageSize := 1; END IF;
    pageTotal := CEIL(totalItem / pageSize);
    pageNumber := LEAST(pageNumber, pageTotal);
    /* END: Init pageSize, pageNumber */---------------------------------------------------------------

    OPEN my_cursor FOR
        SELECT *
        FROM (
                /* GET nameTable.COLUMN                AS   "key" */-------------------------------------------------------
                 SELECT qtsk.ID                        AS   "id",
                        qtsk.SHCC                      AS   "shcc",
                        qtsk.MA_SO                     AS   "maSo",
                        qtsk.TEN_SANG_KIEN             AS   "tenSangKien",
                        qtsk.SO_QUYET_DINH             AS   "soQuyetDinh",
                        qtsk.CAP_ANH_HUONG             AS   "capAnhHuong",

                        cb.HO                          AS   "hoCanBo",
                        cb.TEN                         AS   "tenCanBo",

                        (select dmcv.TEN
                         from QT_CHUC_VU qtcv
                                  left join DM_CHUC_VU dmcv on qtcv.MA_CHUC_VU = dmcv.MA
                         where qtcv.shcc = qtsk.SHCC
                           and qtcv.CHUC_VU_CHINH = 1) as   "tenChucVu",
                        (select dmdv.TEN
                         from QT_CHUC_VU qtcv
                                  left join DM_DON_VI dmdv on qtcv.MA_DON_VI = dmdv.MA
                         where qtcv.shcc = qtsk.SHCC
                           and qtcv.CHUC_VU_CHINH = 1) as   "tenDonVi",
                        (select dmbm.TEN
                         from QT_CHUC_VU qtcv
                                  left join DM_BO_MON dmbm on qtcv.MA_BO_MON = dmbm.MA
                         where qtcv.shcc = qtsk.SHCC
                           and qtcv.CHUC_VU_CHINH = 1) as   "tenBoMon",

                        td.MA                          AS   "maHocVi",
                        td.TEN                         AS   "tenHocVi",

                        cdnn.MA                        AS   "maChucDanhNgheNghiep",
                        cdnn.TEN                       AS   "tenChucDanhNgheNghiep",
                        ROW_NUMBER() OVER (ORDER BY cb.TEN) R

                 /*  Data Field */
                 FROM QT_SANG_KIEN qtsk
                          LEFT JOIN TCHC_CAN_BO cb on qtsk.SHCC = cb.SHCC
                          LEFT JOIN DM_TRINH_DO td ON (cb.HOC_VI = td.MA)
                          LEFT JOIN DM_NGACH_CDNN cdnn ON (cdnn.MA = cb.NGACH)
                 WHERE ((listShcc IS NOT NULL AND cb.SHCC IN (SELECT regexp_substr(listShcc, '[^,]+', 1, level)
                                                              from dual
                                                              connect by regexp_substr(listShcc, '[^,]+', 1, level) is not null))
                     OR (listDonVi IS NOT NULL AND cb.MA_DON_VI IN (SELECT regexp_substr(listDonVi, '[^,]+', 1, level)
                                                                    from dual
                                                                    connect by regexp_substr(listDonVi, '[^,]+', 1, level) is not null))
                     OR (filterCapAnhHuong IS NOT NULL AND qtsk.CAP_ANH_HUONG = filterCapAnhHuong)
                     OR (listShcc IS NULL AND listDonVi IS NULL AND filterCapAnhHuong IS NULL))
                   AND (searchTerm = ''
                     OR LOWER(cb.SHCC) LIKE sT
                     OR LOWER(TRIM(cb.HO || ' ' || cb.TEN)) LIKE sT
                     OR LOWER(qtsk.MA_SO) LIKE sT
                     OR LOWER(qtsk.TEN_SANG_KIEN) LIKE sT)
                 /* End Data Field */

                 ORDER BY cb.TEN
             )
        WHERE R BETWEEN (pageNumber - 1) * pageSize + 1 AND pageNumber * pageSize;
    RETURN my_cursor;

END;

/
--EndMethod--

CREATE OR REPLACE FUNCTION QUAN_HE_GIA_DINH_BY_SHCC(isSHCC in STRING) RETURN SYS_REFCURSOR
AS
    cur SYS_REFCURSOR;
BEGIN
    OPEN cur FOR
        SELECT
               qhcb.ID AS "id",
               qhcb.HO_TEN AS "hoTen",
               qhcb.MOI_QUAN_HE AS "moiQuanHe",
               dmqh.TEN AS "tenMoiQuanHe",
               qhcb.NAM_SINH AS "namSinh",
               qhcb.NGHE_NGHIEP AS "ngheNghiep",
               qhcb.NOI_CONG_TAC AS "noiCongTac",
               dmqh.LOAI AS "loai",
               qhcb.DIA_CHI AS "diaChi",
               qhcb.QUE_QUAN AS "queQuan"
        FROM QUAN_HE_CAN_BO qhcb
                 LEFT JOIN DM_QUAN_HE_GIA_DINH dmqh ON dmqh.MA = qhcb.MOI_QUAN_HE
        WHERE isSHCC = qhcb.SHCC
    ORDER BY  qhcb.NAM_SINH ;
    return cur;
END;

/
--EndMethod--

CREATE OR REPLACE FUNCTION SACH_GIAO_TRINH_GROUP_PAGE(pageNumber IN OUT NUMBER, pageSize IN OUT NUMBER,
                                           list_shcc IN STRING, list_dv IN STRING,
                                           fromYear IN NUMBER, toYear IN NUMBER, searchTerm IN STRING,
                                           totalItem OUT NUMBER, pageTotal OUT NUMBER) RETURN SYS_REFCURSOR
AS
    my_cursor SYS_REFCURSOR;
    sT        STRING(500) := '%' || lower(searchTerm) || '%';
BEGIN
    SELECT COUNT(*)
    INTO totalItem

    FROM (SELECT *
          FROM SACH_GIAO_TRINH
          WHERE ID IN (SELECT MAX(ID) FROM (SELECT * FROM SACH_GIAO_TRINH ORDER BY SHCC DESC) GROUP BY SHCC)) sgt
             LEFT JOIN TCHC_CAN_BO cb on sgt.SHCC = cb.SHCC
             LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
             LEFT JOIN DM_TRINH_DO td ON (cb.HOC_VI = td.MA)
             LEFT JOIN DM_NGACH_CDNN cdnn ON (cdnn.MA = cb.NGACH);
    IF pageNumber < 1 THEN pageNumber := 1; END IF;
    IF pageSize < 1 THEN pageSize := 1; END IF;
    pageTotal := CEIL(totalItem / pageSize);
    pageNumber := LEAST(pageNumber, pageTotal);

    OPEN my_cursor FOR
        SELECT *
        FROM (SELECT sgt.ID                                     AS  "id",
                     sgt.SHCC                                   AS  "shcc",
                     (SELECT COUNT(*)
                      FROM SACH_GIAO_TRINH sgt_temp
                               LEFT JOIN TCHC_CAN_BO cb on sgt_temp.SHCC = cb.SHCC
                               LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
                      WHERE (sgt_temp.SHCC = sgt.SHCC)
                        AND (((list_shcc IS NULL) AND (list_dv IS NULL) AND (fromYear IS NULL) AND (toYear IS NULL))
                          OR (((list_shcc IS NOT NULL AND INSTR(list_shcc, sgt_temp.SHCC) != 0)
                              OR (list_dv IS NOT NULL AND INSTR(list_dv, cb.MA_DON_VI) != 0)
                              OR (list_shcc IS NULL AND list_dv IS NULL))
                              AND (sgt_temp.NAM_SAN_XUAT IS NOT NULL AND
                                   (fromYear IS NULL OR sgt_temp.NAM_SAN_XUAT >= fromYear))
                              AND (sgt_temp.NAM_SAN_XUAT IS NOT NULL AND
                                   (toYear IS NULL OR sgt_temp.NAM_SAN_XUAT <= toYear))))
                        AND (searchTerm = ''
                          OR LOWER(cb.SHCC) LIKE sT
                          OR LOWER(TRIM(cb.HO || ' ' || cb.TEN)) LIKE sT
                          OR LOWER(sgt_temp.TEN) LIKE sT
                          OR LOWER(sgt_temp.SAN_PHAM) LIKE sT
                          OR LOWER(sgt_temp.NHA_SAN_XUAT) LIKE sT
                          OR LOWER(sgt_temp.BUT_DANH) LIKE sT)) AS  "soLuong",

                     (select rtrim(xmlagg(xmlelement(e, sgt_temp.TEN || ' ', '??').extract('//text()') order by
                                          null).getclobval(), '??')
                      FROM SACH_GIAO_TRINH sgt_temp
                               LEFT JOIN TCHC_CAN_BO cb on sgt_temp.SHCC = cb.SHCC
                               LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
                      WHERE (sgt_temp.SHCC = sgt.SHCC)
                        AND (((list_shcc IS NULL) AND (list_dv IS NULL) AND (fromYear IS NULL) AND (toYear IS NULL))
                          OR (((list_shcc IS NOT NULL AND INSTR(list_shcc, sgt_temp.SHCC) != 0)
                              OR (list_dv IS NOT NULL AND INSTR(list_dv, cb.MA_DON_VI) != 0)
                              OR (list_shcc IS NULL AND list_dv IS NULL))
                              AND (sgt_temp.NAM_SAN_XUAT IS NOT NULL AND
                                   (fromYear IS NULL OR sgt_temp.NAM_SAN_XUAT >= fromYear))
                              AND (sgt_temp.NAM_SAN_XUAT IS NOT NULL AND
                                   (toYear IS NULL OR sgt_temp.NAM_SAN_XUAT <= toYear))))
                        AND (searchTerm = ''
                          OR LOWER(cb.SHCC) LIKE sT
                          OR LOWER(TRIM(cb.HO || ' ' || cb.TEN)) LIKE sT
                          OR LOWER(sgt_temp.TEN) LIKE sT
                          OR LOWER(sgt_temp.SAN_PHAM) LIKE sT
                          OR LOWER(sgt_temp.NHA_SAN_XUAT) LIKE sT
                          OR LOWER(sgt_temp.BUT_DANH) LIKE sT)) AS  "danhSach",

                     cb.HO                                      AS  "hoCanBo",
                     cb.TEN                                     AS  "tenCanBo",
                     dv.MA                                      AS  "maDonVi",
                     dv.TEN                                     AS  "tenDonVi",
                     (SELECT DMCV.TEN
                      FROM QT_CHUC_VU QTCV
                               LEFT JOIN DM_CHUC_VU DMCV ON DMCV.MA = QTCV.MA_CHUC_VU
                      WHERE QTCV.SHCC = CB.SHCC
                        AND CHUC_VU_CHINH = 1)                  AS  "tenChucVu",

                     (SELECT QTCV.MA_CHUC_VU
                      FROM QT_CHUC_VU QTCV
                      WHERE QTCV.SHCC = CB.SHCC
                        AND CHUC_VU_CHINH = 1)                  AS  "maChucVu",

                     td.MA                                      AS  "maHocVi",
                     td.TEN                                     AS  "tenHocVi",

                     cdnn.MA                                    AS  "maChucDanhNgheNghiep",
                     cdnn.TEN                                   AS  "tenChucDanhNgheNghiep",
                     ROW_NUMBER() OVER (ORDER BY NAM_SAN_XUAT DESC) R
              FROM (SELECT *
                    FROM SACH_GIAO_TRINH
                    WHERE ID IN
                          (SELECT MAX(ID) FROM (SELECT * FROM SACH_GIAO_TRINH ORDER BY SHCC DESC) GROUP BY SHCC)) sgt
                       LEFT JOIN TCHC_CAN_BO cb on sgt.SHCC = cb.SHCC
                       LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
                       LEFT JOIN DM_TRINH_DO td ON (cb.HOC_VI = td.MA)
                       LEFT JOIN DM_NGACH_CDNN cdnn ON (cdnn.MA = cb.NGACH)
              ORDER BY sgt.NAM_SAN_XUAT DESC)
        WHERE R BETWEEN (pageNumber - 1) * pageSize + 1 AND pageNumber * pageSize;
    RETURN my_cursor;

END;

/
--EndMethod--

CREATE OR REPLACE FUNCTION SACH_GIAO_TRINH_SEARCH_PAGE(pageNumber IN OUT NUMBER, pageSize IN OUT NUMBER,
                                            list_shcc IN STRING, list_dv IN STRING,
                                            fromYear IN NUMBER, toYear IN NUMBER, searchTerm IN STRING,
                                            totalItem OUT NUMBER, pageTotal OUT NUMBER) RETURN SYS_REFCURSOR
AS
    my_cursor SYS_REFCURSOR;
    sT        STRING(500) := '%' || lower(searchTerm) || '%';
BEGIN
    SELECT COUNT(*)
    INTO totalItem

    FROM SACH_GIAO_TRINH sgt
             LEFT JOIN TCHC_CAN_BO cb on sgt.SHCC = cb.SHCC
             LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
             LEFT JOIN DM_TRINH_DO td ON (cb.HOC_VI = td.MA)
             LEFT JOIN DM_NGACH_CDNN cdnn ON (cdnn.MA = cb.NGACH)
    WHERE (((list_shcc IS NULL) AND (list_dv IS NULL) AND (fromYear IS NULL) AND (toYear IS NULL))
        OR (((list_shcc IS NOT NULL AND cb.SHCC IN (SELECT regexp_substr(list_shcc, '[^,]+', 1, level)
                                                    from dual
                                                    connect by regexp_substr(list_shcc, '[^,]+', 1, level) is not null))
            OR (list_dv IS NOT NULL AND cb.MA_DON_VI IN (SELECT regexp_substr(list_dv, '[^,]+', 1, level)
                                                         from dual
                                                         connect by regexp_substr(list_dv, '[^,]+', 1, level) is not null))
            OR (list_shcc IS NULL AND list_dv IS NULL))
            AND (sgt.NAM_SAN_XUAT IS NOT NULL AND (fromYear IS NULL OR sgt.NAM_SAN_XUAT >= fromYear))
            AND (sgt.NAM_SAN_XUAT IS NOT NULL AND (toYear IS NULL OR sgt.NAM_SAN_XUAT <= toYear))))
      AND (searchTerm = ''
        OR LOWER(cb.SHCC) LIKE sT
        OR LOWER(TRIM(cb.HO || ' ' || cb.TEN)) LIKE sT
        OR LOWER(sgt.TEN) LIKE sT
        OR LOWER(sgt.THE_LOAI) LIKE sT
        OR LOWER(sgt.SAN_PHAM) LIKE sT
        OR LOWER(sgt.CHU_BIEN) LIKE sT
        OR LOWER(sgt.NHA_SAN_XUAT) LIKE sT
        OR LOWER(sgt.BUT_DANH) LIKE sT);

    IF pageNumber < 1 THEN pageNumber := 1; END IF;
    IF pageSize < 1 THEN pageSize := 1; END IF;
    pageTotal := CEIL(totalItem / pageSize);
    pageNumber := LEAST(pageNumber, pageTotal);

    OPEN my_cursor FOR
        SELECT *
        FROM (SELECT sgt.ID                    AS                   "id",
                     sgt.TEN                   AS                   "ten",
                     sgt.THE_LOAI              AS                   "theLoai",
                     sgt.NHA_SAN_XUAT          AS                   "nhaSanXuat",
                     sgt.NAM_SAN_XUAT          AS                   "namSanXuat",
                     sgt.SAN_PHAM              AS                   "sanPham",
                     sgt.CHU_BIEN              AS                   "chuBien",
                     sgt.BUT_DANH              AS                   "butDanh",
                     sgt.QUOC_TE               AS                   "quocTe",
                     sgt.SHCC                  AS                   "shcc",

                     cb.HO                     AS                   "hoCanBo",
                     cb.TEN                    AS                   "tenCanBo",

                     dv.MA                     AS                   "maDonVi",
                     dv.TEN                    AS                   "tenDonVi",
                     (SELECT DMCV.TEN
                      FROM QT_CHUC_VU QTCV
                               LEFT JOIN DM_CHUC_VU DMCV ON DMCV.MA = QTCV.MA_CHUC_VU
                      WHERE QTCV.SHCC = CB.SHCC
                        AND CHUC_VU_CHINH = 1) AS                   "tenChucVu",

                     (SELECT QTCV.MA_CHUC_VU
                      FROM QT_CHUC_VU QTCV
                      WHERE QTCV.SHCC = CB.SHCC
                        AND CHUC_VU_CHINH = 1) AS                   "maChucVu",
                     td.MA                     AS                   "maHocVi",
                     td.TEN                    AS                   "tenHocVi",

                     cdnn.MA                   AS                   "maChucDanhNgheNghiep",
                     cdnn.TEN                  AS                   "tenChucDanhNgheNghiep",

                     ROW_NUMBER() OVER (ORDER BY NAM_SAN_XUAT DESC) R
              FROM SACH_GIAO_TRINH sgt
                       LEFT JOIN TCHC_CAN_BO cb on sgt.SHCC = cb.SHCC
                       LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
                       LEFT JOIN DM_TRINH_DO td ON (cb.HOC_VI = td.MA)
                       LEFT JOIN DM_NGACH_CDNN cdnn ON (cdnn.MA = cb.NGACH)
              WHERE (((list_shcc IS NULL) AND (list_dv IS NULL) AND (fromYear IS NULL) AND (toYear IS NULL))
                  OR (((list_shcc IS NOT NULL AND cb.SHCC IN (SELECT regexp_substr(list_shcc, '[^,]+', 1, level)
                                                              from dual
                                                              connect by regexp_substr(list_shcc, '[^,]+', 1, level) is not null))
                      OR (list_dv IS NOT NULL AND cb.MA_DON_VI IN (SELECT regexp_substr(list_dv, '[^,]+', 1, level)
                                                                   from dual
                                                                   connect by regexp_substr(list_dv, '[^,]+', 1, level) is not null))
                      OR (list_shcc IS NULL AND list_dv IS NULL))
                      AND (sgt.NAM_SAN_XUAT IS NOT NULL AND (fromYear IS NULL OR sgt.NAM_SAN_XUAT >= fromYear))
                      AND (sgt.NAM_SAN_XUAT IS NOT NULL AND (toYear IS NULL OR sgt.NAM_SAN_XUAT <= toYear))))
                AND (searchTerm = ''
                  OR LOWER(cb.SHCC) LIKE sT
                  OR LOWER(TRIM(cb.HO || ' ' || cb.TEN)) LIKE sT
                  OR LOWER(sgt.TEN) LIKE sT
                  OR LOWER(sgt.THE_LOAI) LIKE sT
                  OR LOWER(sgt.SAN_PHAM) LIKE sT
                  OR LOWER(sgt.CHU_BIEN) LIKE sT
                  OR LOWER(sgt.NHA_SAN_XUAT) LIKE sT
                  OR LOWER(sgt.BUT_DANH) LIKE sT)
              ORDER BY sgt.NAM_SAN_XUAT DESC)
        WHERE R BETWEEN (pageNumber - 1) * pageSize + 1 AND pageNumber * pageSize;
    RETURN my_cursor;

END;

/
--EndMethod--

CREATE OR REPLACE FUNCTION STUDENT_DASHBOARD_TOTAL_GENDER RETURN SYS_REFCURSOR
AS CUR SYS_REFCURSOR;
BEGIN
    OPEN CUR FOR
            SELECT
                   COUNT(CASE WHEN SV.MSSV IS NOT NULL THEN 1 END) AS "totalStaff",
                   COUNT(CASE WHEN SV.GIOI_TINH = 1 THEN 1 END) AS "totalMale",
                   COUNT(CASE WHEN SV.GIOI_TINH = 2 THEN 1 END) AS "totalFemale"
           FROM FW_STUDENT SV;

    RETURN CUR;
END;

/
--EndMethod--

CREATE OR REPLACE PROCEDURE sub_menu_swap_priority (p_ma in NUMBER, p_thu_tu in number, p_is_up in number)
IS
BEGIN
    IF p_is_up=1 THEN
        UPDATE FW_SUBMENU SET PRIORITY=PRIORITY+1 WHERE PRIORITY >= p_thu_tu;
    ELSE
        UPDATE FW_SUBMENU SET PRIORITY=PRIORITY-1 WHERE PRIORITY <= p_thu_tu;
    END IF;
    UPDATE FW_SUBMENU SET PRIORITY=p_thu_tu WHERE ID=p_ma;
    commit;
END;

/
--EndMethod--

CREATE OR REPLACE FUNCTION TCCB_CAN_BO_DOWNLOAD_EXCEL(filter IN STRING, searchTerm IN STRING) RETURN SYS_REFCURSOR
AS
    canbosys SYS_REFCURSOR;
    ST       STRING(500) := '%' || lower(searchTerm) || '%';
    listShcc STRING(100);
    listDonVi STRING(100);
    listNgach STRING(100);
    listHocVi STRING(100);
    listChucDanh STRING(100);
    gender STRING(3);
    isBienChe NUMBER;
    fromYear NUMBER;
    toYear NUMBER;
    listDanToc STRING(100);
    listTonGiao STRING(100);
    loaiHopDong NUMBER;
    loaiChuyenVien NUMBER;
    listQuocGia STRING(100);
    fromAge NUMBER;
    toAge NUMBER;
    listChuyenNganh STRING(100);
BEGIN
    SELECT JSON_VALUE(filter, '$.listShcc') INTO listShcc FROM DUAL;
    SELECT JSON_VALUE(filter, '$.listDonVi') INTO listDonVi FROM DUAL;
    SELECT JSON_VALUE(filter, '$.gender') INTO gender FROM DUAL;
    SELECT JSON_VALUE(filter, '$.listNgach') INTO listNgach FROM DUAL;
    SELECT JSON_VALUE(filter, '$.listHocVi') INTO listHocVi FROM DUAL;
    SELECT JSON_VALUE(filter, '$.listChucDanh') INTO listChucDanh FROM DUAL;
    SELECT JSON_VALUE(filter, '$.isBienChe') INTO isBienChe FROM DUAL;
    SELECT JSON_VALUE(filter, '$.fromYear') INTO fromYear FROM DUAL;
    SELECT JSON_VALUE(filter, '$.toYear') INTO toYear FROM DUAL;
    SELECT JSON_VALUE(filter, '$.listDanToc') INTO listDanToc FROM DUAL;
    SELECT JSON_VALUE(filter, '$.listTonGiao') INTO listTonGiao FROM DUAL;
    SELECT JSON_VALUE(filter, '$.loaiHopDong') INTO loaiHopDong FROM DUAL;
    SELECT JSON_VALUE(filter, '$.loaiChuyenVien') INTO loaiChuyenVien FROM DUAL;
    SELECT JSON_VALUE(filter, '$.listQuocGia') INTO listQuocGia FROM DUAL;
    SELECT JSON_VALUE(filter, '$.fromAge') INTO fromAge FROM DUAL;
    SELECT JSON_VALUE(filter, '$.toAge') INTO toAge FROM DUAL;
    SELECT JSON_VALUE(filter, '$.listChuyenNganh') INTO listChuyenNganh FROM DUAL;

    OPEN canbosys FOR
        SELECT *
        FROM (
                 SELECT CB.SHCC                  AS "shcc",
                        CB.HO                    AS "ho",
                        CB.TEN                   AS "ten",
                        CB.PHAI                  AS "phai",
                        CB.MA_DON_VI             AS "maDonVi",
                        DV.TEN                   AS "tenDonVi",
                        NG.MA AS "ngach",
                        NG.TEN                   AS "tenChucDanhNgheNghiep",
                        TRINH_DO.TEN             AS "hocVi",
                        CB.NAM_HOC_VI AS "namHocVi",
                        CD.TEN                   AS "hocHam",
                        CB.NAM_CHUC_DANH AS "namChucDanh",
                        CB.CHUYEN_NGANH_CHUC_DANH AS "chuyenNganhChucDanh",
                        CB.NGAY_BAT_DAU_CONG_TAC AS "ngayBatDauCongTac",
                        CB.NGAY_BIEN_CHE         AS "ngayBienChe",
                        CB.THAC_SI               AS "thacSi",
                        CB.TIEN_SI               AS "tienSi",
                        CB.CHUYEN_NGANH          AS "chuyenNganh",
                        CB.QUE_QUAN AS "queQuan",
                        CB.IS_CVDT AS "isCvdt",
                        CB.IS_HDTN AS "isHdtn",
                        CB.HOC_VI_NOI_TOT_NGHIEP AS "hocViNoiTotNghiep",
                        CB.TRINH_DO_PHO_THONG AS "trinhDoPhoThong",
                        CB.HE_SO_LUONG AS "heSoLuong",
                        CB.BAC_LUONG AS "bacLuong",
                        CB.MOC_NANG_LUONG AS "mocNangLuong",
                        CB.TY_LE_VUOT_KHUNG AS "tyLeVuotKhung",
                        CB.CMND AS "cmnd",
                        CB.CMND_NGAY_CAP AS "cmndNgayCap",
                        CB.CMND_NOI_CAP AS "cmndNoiCap",
                        CB.DANH_HIEU AS "danhHieu",
                        CB.DANG_VIEN AS "dangVien",
                        CB.GHI_CHU AS "ghiChu",
                        (SELECT DMCV.TEN
                         FROM QT_CHUC_VU QTCV
                                  LEFT JOIN DM_CHUC_VU DMCV ON DMCV.MA = QTCV.MA_CHUC_VU
                         WHERE QTCV.SHCC = CB.SHCC
                           AND CHUC_VU_CHINH = 1) AS        "chucVuChinh",

                        (SELECT QTCV.MA_CHUC_VU
                         FROM QT_CHUC_VU QTCV
                         WHERE QTCV.SHCC = CB.SHCC
                           AND CHUC_VU_CHINH = 1) AS        "maChucVuChinh",

                        (SELECT QTCV.NGAY_RA_QD
                         FROM QT_CHUC_VU QTCV
                         WHERE QTCV.SHCC = CB.SHCC
                           AND CHUC_VU_CHINH = 1) AS        "boNhiemNgay",

                        (SELECT DMCV.PHU_CAP
                         FROM QT_CHUC_VU QTCV
                                  LEFT JOIN DM_CHUC_VU DMCV ON DMCV.MA = QTCV.MA_CHUC_VU
                         WHERE QTCV.SHCC = CB.SHCC
                           AND CHUC_VU_CHINH = 1) AS        "phuCapChucVu",
                        (CASE
                             WHEN CB.NGAY_BIEN_CHE IS NULL THEN 'Hợp đồng'
                             ELSE 'Biên chế'
                            END)                 AS "loaiCanBo",
                        (select rtrim(xmlagg(xmlelement(e, dmqg.TEN_QUOC_GIA, '-').extract('//text()') order by null).getclobval(), '-')
                         FROM DM_QUOC_GIA dmqg
                         WHERE INSTR(CB.HOC_VI_NOI_TOT_NGHIEP, dmqg.MA_CODE) != 0
                        ) AS "danhSahcQuocGiaHocViNoiTotNghiep",
--                         (CASE
--                              WHEN CB.TIEN_SI = 1 THEN
--                                  (SELECT qtdt.KET_THUC
--                                   FROM QT_DAO_TAO qtdt
--                                   WHERE qtdt.SHCC = CB.SHCC
--                                     AND qtdt.TRINH_DO = '4' AND ROWNUM <= 1)
--                             END)                  AS "ngayCapNhatTienSi",
--                         (CASE WHEN CB.THAC_SI = 1 THEN
--                                  (SELECT qtdt.KET_THUC
--                                    FROM QT_DAO_TAO qtdt
--                                    WHERE qtdt.SHCC = CB.SHCC AND qtdt.TRINH_DO = '3' AND ROWNUM <= 1)
--                             END)                  AS "ngayCapNhatThacSi",

                        CB.NGAY_SINH              AS        "ngaySinh",
                        CB.EMAIL                  AS        "email",

                        dmDanToc.MA AS "maDanToc",
                        dmDanToc.TEN AS "tenDanToc",

                        dmTonGiao.MA AS "maTonGiao",
                        dmTonGiao.TEN AS "tenTonGiao",

                        ROW_NUMBER() OVER (ORDER BY CB.TEN) R
                 FROM TCHC_CAN_BO CB
                          LEFT JOIN DM_DON_VI DV on CB.MA_DON_VI = DV.MA
                          LEFT JOIN DM_TRINH_DO TRINH_DO ON TRINH_DO.MA = CB.HOC_VI
                          LEFT JOIN DM_NGACH_CDNN NG on CB.NGACH = NG.MA
                          LEFT JOIN DM_CHUC_DANH_KHOA_HOC CD ON CB.CHUC_DANH = CD.MA
                         LEFT JOIN DM_DAN_TOC dmDanToc ON CB.DAN_TOC = dmDanToc.MA
                         LEFT JOIN DM_TON_GIAO dmTonGiao ON CB.TON_GIAO = dmTonGiao.MA

                WHERE (
                        ((listShcc IS NOT NULL AND cb.SHCC IN (SELECT regexp_substr(listShcc, '[^,]+', 1, level) from dual connect by regexp_substr(listShcc, '[^,]+', 1, level) is not null))
                            OR (listDonVi IS NOT NULL AND cb.MA_DON_VI IN (SELECT regexp_substr(listDonVi, '[^,]+', 1, level) from dual connect by regexp_substr(listDonVi, '[^,]+', 1, level) is not null))
                            OR (listShcc IS NULL AND listDonVi IS NULL))
                        AND (gender IS NULL OR gender IS NOT NULL AND CB.PHAI = gender)
                        AND (listNgach IS NULL OR
                             listNgach IS NOT NULL AND CB.NGACH IN (SELECT regexp_substr(listNgach, '[^,]+', 1, level)
                                                                    from dual
                                                                    connect by regexp_substr(listNgach, '[^,]+', 1, level) is not null))
                        AND (listHocVi IS NULL OR
                             listHocVi IS NOT NULL AND CB.HOC_VI IN (SELECT regexp_substr(listHocVi, '[^,]+', 1, level)
                                                                     from dual
                                                                     connect by regexp_substr(listHocVi, '[^,]+', 1, level) is not null))
                        AND (listChucDanh IS NULL OR
                             listChucDanh IS NOT NULL AND CB.CHUC_DANH IN (SELECT regexp_substr(listChucDanh, '[^,]+', 1, level)
                                                                           from dual
                                                                           connect by regexp_substr(listChucDanh, '[^,]+', 1, level) is not null))
                        AND (isBienChe IS NULL OR
                             (isBienChe = 0 AND NGAY_BIEN_CHE IS NOT NULL) OR
                             (isBienChe = 1 AND NGAY_BIEN_CHE IS NULL)
                            )
                        AND (fromYear IS NULL OR (CB.NGAY_BAT_DAU_CONG_TAC IS NOT NULL AND CB.NGAY_BAT_DAU_CONG_TAC >= fromYear))
                        AND (toYear IS NULL OR (CB.NGAY_BAT_DAU_CONG_TAC IS NOT NULL AND CB.NGAY_BAT_DAU_CONG_TAC <= toYear))
                        AND (listDanToc IS NULL OR (CB.DAN_TOC IN (SELECT regexp_substr(listDanToc, '[^,]+', 1, level) from dual connect by regexp_substr(listDanToc, '[^,]+', 1, level) is not null)))
                        AND (listTonGiao IS NULL OR (CB.TON_GIAO IN (SELECT regexp_substr(listTonGiao, '[^,]+', 1, level) from dual connect by regexp_substr(listTonGiao, '[^,]+', 1, level) is not null)))
                        AND (listQuocGia IS NULL OR (CB.HOC_VI_NOI_TOT_NGHIEP IS NOT NULL AND
                            EXISTS(
                                SELECT regexp_substr(TO_CHAR(CB.HOC_VI_NOI_TOT_NGHIEP), '[^,]+', 1, level) from dual connect by regexp_substr(TO_CHAR(CB.HOC_VI_NOI_TOT_NGHIEP), '[^,]+', 1, level) is not null
                                INTERSECT
                                SELECT regexp_substr(listQuocGia, '[^,]+', 1, level) from dual connect by regexp_substr(listQuocGia, '[^,]+', 1, level) is not null
                                )
                            ))
                        AND (loaiHopDong IS NULL OR CB.IS_HDTN = loaiHopDong)
                        AND (loaiChuyenVien IS NULL OR CB.IS_CVDT = loaiChuyenVien)
                        AND (fromAge IS NULL OR (cb.NGAY_SINH IS NOT NULL AND (SELECT TRUNC(MONTHS_BETWEEN(TRUNC(sysdate), (select to_date('19700101', 'YYYYMMDD') + (1 / 24 / 60 / 60 / 1000) * cb.NGAY_SINH from dual)) / 12) from dual) >= fromAge))
                        AND (toAge IS NULL OR (cb.NGAY_SINH IS NOT NULL AND (SELECT TRUNC(MONTHS_BETWEEN(TRUNC(sysdate), (select to_date('19700101', 'YYYYMMDD') + (1 / 24 / 60 / 60 / 1000) * cb.NGAY_SINH from dual)) / 12) from dual) <= toAge))
                        AND (listChuyenNganh IS NULL OR (CB.CHUYEN_NGANH IN (SELECT regexp_substr(listChuyenNganh, '[^,]+', 1, level) from dual connect by regexp_substr(listChuyenNganh, '[^,]+', 1, level) is not null)))
                    )
                  AND (NGAY_NGHI IS NULL)
                  AND (searchTerm = ''
                    OR LOWER(CB.SHCC) LIKE ST
                    OR LOWER(TRIM(CB.HO || ' ' || CB.TEN)) LIKE ST
                    OR LOWER(CB.EMAIL) LIKE ST
                    OR LOWER(CB.CHUYEN_NGANH) LIKE ST
                    OR LOWER(CB.DANH_HIEU) LIKE ST
                    OR LOWER(CB.GHI_CHU) LIKE ST)
                 ORDER BY CB.TEN
             );
    RETURN canbosys;
end;

/
--EndMethod--

CREATE OR REPLACE FUNCTION TCCB_CAN_BO_SEARCH_PAGE(pageNumber IN OUT NUMBER, pageSize IN OUT NUMBER, filter IN STRING,
                                        searchTerm IN STRING,
                                        totalItem OUT NUMBER, pageTotal OUT NUMBER) RETURN SYS_REFCURSOR
AS
    canbosys        SYS_REFCURSOR;
    ST              STRING(500) := '%' || lower(searchTerm) || '%';
    listShcc        STRING(100);
    listDonVi       STRING(100);
    listNgach       STRING(100);
    listHocVi       STRING(100);
    listChucDanh    STRING(100);
    gender          STRING(3);
    isBienChe       NUMBER;
    fromYear        NUMBER;
    toYear          NUMBER;
    listDanToc      STRING(100);
    listTonGiao     STRING(100);
    loaiHopDong     NUMBER;
    loaiChuyenVien  NUMBER;
    listQuocGia     STRING(100);
    fromAge         NUMBER;
    toAge           NUMBER;
    time            NUMBER;
    listChuyenNganh STRING(100);
    nhanSuDonVi     NUMBER;
    nhanSuQuyen     STRING(100);
BEGIN
    SELECT JSON_VALUE(filter, '$.listShcc') INTO listShcc FROM DUAL;
    SELECT JSON_VALUE(filter, '$.listDonVi') INTO listDonVi FROM DUAL;
    SELECT JSON_VALUE(filter, '$.gender') INTO gender FROM DUAL;
    SELECT JSON_VALUE(filter, '$.listNgach') INTO listNgach FROM DUAL;
    SELECT JSON_VALUE(filter, '$.listHocVi') INTO listHocVi FROM DUAL;
    SELECT JSON_VALUE(filter, '$.listChucDanh') INTO listChucDanh FROM DUAL;
    SELECT JSON_VALUE(filter, '$.isBienChe') INTO isBienChe FROM DUAL;
    SELECT JSON_VALUE(filter, '$.fromYear') INTO fromYear FROM DUAL;
    SELECT JSON_VALUE(filter, '$.toYear') INTO toYear FROM DUAL;
    SELECT JSON_VALUE(filter, '$.listDanToc') INTO listDanToc FROM DUAL;
    SELECT JSON_VALUE(filter, '$.listTonGiao') INTO listTonGiao FROM DUAL;
    SELECT JSON_VALUE(filter, '$.loaiHopDong') INTO loaiHopDong FROM DUAL;
    SELECT JSON_VALUE(filter, '$.loaiChuyenVien') INTO loaiChuyenVien FROM DUAL;
    SELECT JSON_VALUE(filter, '$.listQuocGia') INTO listQuocGia FROM DUAL;
    SELECT JSON_VALUE(filter, '$.fromAge') INTO fromAge FROM DUAL;
    SELECT JSON_VALUE(filter, '$.toAge') INTO toAge FROM DUAL;
    SELECT JSON_VALUE(filter, '$.listChuyenNganh') INTO listChuyenNganh FROM DUAL;
    SELECT JSON_VALUE(filter, '$.nhanSuDonVi') INTO nhanSuDonVi FROM DUAL;
    SELECT JSON_VALUE(filter, '$.nhanSuQuyen') INTO nhanSuQuyen FROM DUAL;

    SELECT COUNT(*)
    INTO totalItem
    FROM TCHC_CAN_BO CB
             LEFT JOIN DM_DON_VI DV on CB.MA_DON_VI = DV.MA
             LEFT JOIN DM_TRINH_DO TRINH_DO ON TRINH_DO.MA = CB.HOC_VI
             LEFT JOIN DM_NGACH_CDNN NG on CB.NGACH = NG.MA
             LEFT JOIN DM_CHUC_DANH_KHOA_HOC CD ON CB.CHUC_DANH = CD.MA
             LEFT JOIN DM_DAN_TOC dmDanToc ON CB.DAN_TOC = dmDanToc.MA
             LEFT JOIN DM_TON_GIAO dmTonGiao ON CB.DAN_TOC = dmTonGiao.MA
--              LEFT JOIN FW_ASSIGN_ROLE fwAssignRole ON CB.SHCC = fwAssignRole.NGUOI_DUOC_GAN
    WHERE (
            ((listShcc IS NOT NULL AND cb.SHCC IN (SELECT regexp_substr(listShcc, '[^,]+', 1, level)
                                                   from dual
                                                   connect by regexp_substr(listShcc, '[^,]+', 1, level) is not null))
                OR (listDonVi IS NOT NULL AND cb.MA_DON_VI IN (SELECT regexp_substr(listDonVi, '[^,]+', 1, level)
                                                               from dual
                                                               connect by regexp_substr(listDonVi, '[^,]+', 1, level) is not null))
                OR (listShcc IS NULL AND listDonVi IS NULL))
            AND (gender IS NULL OR gender IS NOT NULL AND CB.PHAI = gender)
            AND (listNgach IS NULL OR
                 listNgach IS NOT NULL AND CB.NGACH IN (SELECT regexp_substr(listNgach, '[^,]+', 1, level)
                                                        from dual
                                                        connect by regexp_substr(listNgach, '[^,]+', 1, level) is not null))
            AND (listHocVi IS NULL OR
                 listHocVi IS NOT NULL AND CB.HOC_VI IN (SELECT regexp_substr(listHocVi, '[^,]+', 1, level)
                                                         from dual
                                                         connect by regexp_substr(listHocVi, '[^,]+', 1, level) is not null))
            AND (listChucDanh IS NULL OR
                 listChucDanh IS NOT NULL AND CB.CHUC_DANH IN (SELECT regexp_substr(listChucDanh, '[^,]+', 1, level)
                                                               from dual
                                                               connect by regexp_substr(listChucDanh, '[^,]+', 1, level) is not null))
            AND (isBienChe IS NULL OR
                 (isBienChe = 0 AND NGAY_BIEN_CHE IS NOT NULL) OR
                 (isBienChe = 1 AND NGAY_BIEN_CHE IS NULL)
                )
            AND (fromYear IS NULL OR (CB.NGAY_BAT_DAU_CONG_TAC IS NOT NULL AND CB.NGAY_BAT_DAU_CONG_TAC >= fromYear))
            AND (toYear IS NULL OR (CB.NGAY_BAT_DAU_CONG_TAC IS NOT NULL AND CB.NGAY_BAT_DAU_CONG_TAC <= toYear))
            AND (listDanToc IS NULL OR (CB.DAN_TOC IN (SELECT regexp_substr(listDanToc, '[^,]+', 1, level)
                                                       from dual
                                                       connect by regexp_substr(listDanToc, '[^,]+', 1, level) is not null)))
            AND (listTonGiao IS NULL OR (CB.TON_GIAO IN (SELECT regexp_substr(listTonGiao, '[^,]+', 1, level)
                                                         from dual
                                                         connect by regexp_substr(listTonGiao, '[^,]+', 1, level) is not null)))
            AND (listQuocGia IS NULL OR (CB.HOC_VI_NOI_TOT_NGHIEP IS NOT NULL AND
                                         EXISTS(
                                                 SELECT regexp_substr(TO_CHAR(CB.HOC_VI_NOI_TOT_NGHIEP), '[^,]+', 1, level)
                                                 from dual
                                                 connect by
                                                         regexp_substr(TO_CHAR(CB.HOC_VI_NOI_TOT_NGHIEP), '[^,]+', 1, level) is not null
                                                 INTERSECT
                                                 SELECT regexp_substr(listQuocGia, '[^,]+', 1, level)
                                                 from dual
                                                 connect by regexp_substr(listQuocGia, '[^,]+', 1, level) is not null
                                             )
            ))
            AND (loaiHopDong IS NULL OR CB.IS_HDTN = loaiHopDong)
            AND (loaiChuyenVien IS NULL OR CB.IS_CVDT = loaiChuyenVien)
            AND (fromAge IS NULL OR (cb.NGAY_SINH IS NOT NULL AND (SELECT TRUNC(MONTHS_BETWEEN(TRUNC(sysdate),
                                                                                               (select to_date('19700101', 'YYYYMMDD') + (1 / 24 / 60 / 60 / 1000) * cb.NGAY_SINH
                                                                                                from dual)) / 12)
                                                                   from dual) >= fromAge))
            AND (toAge IS NULL OR (cb.NGAY_SINH IS NOT NULL AND (SELECT TRUNC(MONTHS_BETWEEN(TRUNC(sysdate),
                                                                                             (select to_date('19700101', 'YYYYMMDD') + (1 / 24 / 60 / 60 / 1000) * cb.NGAY_SINH
                                                                                              from dual)) / 12)
                                                                 from dual) <= toAge))
            AND
            (listChuyenNganh IS NULL OR (CB.CHUYEN_NGANH IN (SELECT regexp_substr(listChuyenNganh, '[^,]+', 1, level)
                                                             from dual
                                                             connect by regexp_substr(listChuyenNganh, '[^,]+', 1, level) is not null)))
            AND (
                nhanSuDonVi IS NULL OR nhanSuDonVi = CB.MA_DON_VI
                )
            AND (
                        nhanSuQuyen IS NULL OR
--                         nhanSuQuyen = fwAssignRole.TEN_ROLE
                        (
                                    nhanSuQuyen IS NOT NULL AND
                                    EXISTS(
                                            SELECT FWA.ID
                                            FROM FW_ASSIGN_ROLE FWA
                                            WHERE FWA.NGUOI_DUOC_GAN = CB.SHCC
                                              AND FWA.TEN_ROLE = nhanSuQuyen
                                        )
                            )
                )
        )
      AND (NGAY_NGHI IS NULL OR NGAY_NGHI < time)
      AND (searchTerm = ''
        OR LOWER(CB.SHCC) LIKE ST
        OR LOWER(TRIM(CB.HO || ' ' || CB.TEN)) LIKE ST
        OR LOWER(CB.EMAIL) LIKE ST
        OR LOWER(CB.CHUYEN_NGANH) LIKE ST
        OR LOWER(CB.DANH_HIEU) LIKE ST
        OR LOWER(CB.GHI_CHU) LIKE ST);

    IF pageNumber < 1 THEN pageNumber := 1; END IF;
    IF pageSize < 1 THEN pageSize := 1; END IF;
    pageTotal := CEIL(totalItem / pageSize);
    pageNumber := LEAST(pageNumber, pageTotal);

    OPEN canbosys FOR
        SELECT *
        FROM (SELECT CB.SHCC                                                    AS "shcc",
                     CB.HO                                                      AS "ho",
                     CB.TEN                                                     AS "ten",
                     CB.PHAI                                                    AS "phai",
                     CB.MA_DON_VI                                               AS "maDonVi",
                     DV.TEN                                                     AS "tenDonVi",
                     NG.MA                                                      AS "ngach",
                     NG.TEN                                                     AS "tenChucDanhNgheNghiep",
                     TRINH_DO.TEN                                               AS "hocVi",
                     CB.NAM_HOC_VI                                              AS "namHocVi",
                     CD.TEN                                                     AS "hocHam",
                     CB.NAM_CHUC_DANH                                           AS "namChucDanh",
                     CB.CHUYEN_NGANH_CHUC_DANH                                  AS "chuyenNganhChucDanh",
                     CB.NGAY_BAT_DAU_CONG_TAC                                   AS "ngayBatDauCongTac",
                     CB.NGAY_BIEN_CHE                                           AS "ngayBienChe",
                     CB.THAC_SI                                                 AS "thacSi",
                     CB.TIEN_SI                                                 AS "tienSi",
                     CB.CHUYEN_NGANH                                            AS "chuyenNganh",
                     CB.QUE_QUAN                                                AS "queQuan",
                     CB.IS_CVDT                                                 AS "isCvdt",
                     CB.IS_HDTN                                                 AS "isHdtn",
                     CB.HOC_VI_NOI_TOT_NGHIEP                                   AS "hocViNoiTotNghiep",
                     CB.TRINH_DO_PHO_THONG                                      AS "trinhDoPhoThong",
                     CB.HE_SO_LUONG                                             AS "heSoLuong",
                     CB.BAC_LUONG                                               AS "bacLuong",
                     CB.MOC_NANG_LUONG                                          AS "mocNangLuong",
                     CB.TY_LE_VUOT_KHUNG                                        AS "tyLeVuotKhung",
                     CB.CMND                                                    AS "cmnd",
                     CB.CMND_NGAY_CAP                                           AS "cmndNgayCap",
                     CB.CMND_NOI_CAP                                            AS "cmndNoiCap",
                     CB.DANH_HIEU                                               AS "danhHieu",
                     CB.DANG_VIEN                                               AS "dangVien",
                     CB.GHI_CHU                                                 AS "ghiChuStaff",
                     CB.LAST_MODIFIED                                           as "lastModified",
                     (SELECT DMCV.TEN
                      FROM QT_CHUC_VU QTCV
                               LEFT JOIN DM_CHUC_VU DMCV ON DMCV.MA = QTCV.MA_CHUC_VU
                      WHERE QTCV.SHCC = CB.SHCC
                        AND CHUC_VU_CHINH = 1)                                  AS "chucVuChinh",

                     (SELECT QTCV.MA_CHUC_VU
                      FROM QT_CHUC_VU QTCV
                      WHERE QTCV.SHCC = CB.SHCC
                        AND CHUC_VU_CHINH = 1)                                  AS "maChucVuChinh",

                     (SELECT QTCV.NGAY_RA_QD
                      FROM QT_CHUC_VU QTCV
                      WHERE QTCV.SHCC = CB.SHCC
                        AND CHUC_VU_CHINH = 1)                                  AS "boNhiemNgay",

                     (SELECT DMCV.PHU_CAP
                      FROM QT_CHUC_VU QTCV
                               LEFT JOIN DM_CHUC_VU DMCV ON DMCV.MA = QTCV.MA_CHUC_VU
                      WHERE QTCV.SHCC = CB.SHCC
                        AND CHUC_VU_CHINH = 1)                                  AS "phuCapChucVu",
                     (CASE
                          WHEN CB.NGAY_BIEN_CHE IS NULL THEN 'Hợp đồng'
                          ELSE 'Biên chế'
                         END)                                                   AS "loaiCanBo",

                     (SELECT LISTAGG(FAR.NHOM_ROLE, ',') WITHIN GROUP ( ORDER BY FAR.TEN_ROLE)
                      FROM FW_ASSIGN_ROLE FAR
                      WHERE FAR.NGUOI_DUOC_GAN = CB.SHCC
                     )                                                          AS "nhomRole",
                     (select rtrim(xmlagg(xmlelement(e, dmqg.TEN_QUOC_GIA, '-').extract('//text()') order by
                                          null).getclobval(), '-')
                      FROM DM_QUOC_GIA dmqg
                      WHERE INSTR(CB.HOC_VI_NOI_TOT_NGHIEP, dmqg.MA_CODE) != 0) AS "danhSahcQuocGiaHocViNoiTotNghiep",
--                         (CASE
--                              WHEN CB.TIEN_SI = 1 THEN
--                                  (SELECT qtdt.KET_THUC
--                                   FROM QT_DAO_TAO qtdt
--                                   WHERE qtdt.SHCC = CB.SHCC
--                                     AND qtdt.TRINH_DO = '4' AND ROWNUM <= 1)
--                             END)                  AS "ngayCapNhatTienSi",
--                         (CASE WHEN CB.THAC_SI = 1 THEN
--                                  (SELECT qtdt.KET_THUC
--                                    FROM QT_DAO_TAO qtdt
--                                    WHERE qtdt.SHCC = CB.SHCC AND qtdt.TRINH_DO = '3' AND ROWNUM <= 1)
--                             END)                  AS "ngayCapNhatThacSi",

                     CB.NGAY_SINH                                               AS "ngaySinh",
                     CB.EMAIL                                                   AS "email",

                     dmDanToc.MA                                                AS "maDanToc",
                     dmDanToc.TEN                                               AS "tenDanToc",

                     dmTonGiao.MA                                               AS "maTonGiao",
                     dmTonGiao.TEN                                              AS "tenTonGiao",

                     ROW_NUMBER() OVER (ORDER BY CB.TEN)                           R
              FROM TCHC_CAN_BO CB
                       LEFT JOIN DM_DON_VI DV on CB.MA_DON_VI = DV.MA
                       LEFT JOIN DM_TRINH_DO TRINH_DO ON TRINH_DO.MA = CB.HOC_VI
                       LEFT JOIN DM_NGACH_CDNN NG on CB.NGACH = NG.MA
                       LEFT JOIN DM_CHUC_DANH_KHOA_HOC CD ON CB.CHUC_DANH = CD.MA
                       LEFT JOIN DM_DAN_TOC dmDanToc ON CB.DAN_TOC = dmDanToc.MA
                       LEFT JOIN DM_TON_GIAO dmTonGiao ON CB.TON_GIAO = dmTonGiao.MA
--                        LEFT JOIN FW_ASSIGN_ROLE fwAssignRole ON CB.SHCC = fwAssignRole.NGUOI_DUOC_GAN
              WHERE (
                      ((listShcc IS NOT NULL AND cb.SHCC IN (SELECT regexp_substr(listShcc, '[^,]+', 1, level)
                                                             from dual
                                                             connect by regexp_substr(listShcc, '[^,]+', 1, level) is not null))
                          OR
                       (listDonVi IS NOT NULL AND cb.MA_DON_VI IN (SELECT regexp_substr(listDonVi, '[^,]+', 1, level)
                                                                   from dual
                                                                   connect by regexp_substr(listDonVi, '[^,]+', 1, level) is not null))
                          OR (listShcc IS NULL AND listDonVi IS NULL))
                      AND (gender IS NULL OR gender IS NOT NULL AND CB.PHAI = gender)
                      AND (listNgach IS NULL OR
                           listNgach IS NOT NULL AND CB.NGACH IN (SELECT regexp_substr(listNgach, '[^,]+', 1, level)
                                                                  from dual
                                                                  connect by regexp_substr(listNgach, '[^,]+', 1, level) is not null))
                      AND (listHocVi IS NULL OR
                           listHocVi IS NOT NULL AND CB.HOC_VI IN (SELECT regexp_substr(listHocVi, '[^,]+', 1, level)
                                                                   from dual
                                                                   connect by regexp_substr(listHocVi, '[^,]+', 1, level) is not null))
                      AND (listChucDanh IS NULL OR
                           listChucDanh IS NOT NULL AND
                           CB.CHUC_DANH IN (SELECT regexp_substr(listChucDanh, '[^,]+', 1, level)
                                            from dual
                                            connect by regexp_substr(listChucDanh, '[^,]+', 1, level) is not null))
                      AND (isBienChe IS NULL OR
                           (isBienChe = 0 AND NGAY_BIEN_CHE IS NOT NULL) OR
                           (isBienChe = 1 AND NGAY_BIEN_CHE IS NULL)
                          )
                      AND (fromYear IS NULL OR
                           (CB.NGAY_BAT_DAU_CONG_TAC IS NOT NULL AND CB.NGAY_BAT_DAU_CONG_TAC >= fromYear))
                      AND
                      (toYear IS NULL OR (CB.NGAY_BAT_DAU_CONG_TAC IS NOT NULL AND CB.NGAY_BAT_DAU_CONG_TAC <= toYear))
                      AND (listDanToc IS NULL OR (CB.DAN_TOC IN (SELECT regexp_substr(listDanToc, '[^,]+', 1, level)
                                                                 from dual
                                                                 connect by regexp_substr(listDanToc, '[^,]+', 1, level) is not null)))
                      AND (listTonGiao IS NULL OR (CB.TON_GIAO IN (SELECT regexp_substr(listTonGiao, '[^,]+', 1, level)
                                                                   from dual
                                                                   connect by regexp_substr(listTonGiao, '[^,]+', 1, level) is not null)))
                      AND (listQuocGia IS NULL OR (CB.HOC_VI_NOI_TOT_NGHIEP IS NOT NULL AND
                                                   EXISTS(
                                                           SELECT regexp_substr(TO_CHAR(CB.HOC_VI_NOI_TOT_NGHIEP), '[^,]+', 1, level)
                                                           from dual
                                                           connect by
                                                                   regexp_substr(TO_CHAR(CB.HOC_VI_NOI_TOT_NGHIEP), '[^,]+', 1, level) is not null
                                                           INTERSECT
                                                           SELECT regexp_substr(listQuocGia, '[^,]+', 1, level)
                                                           from dual
                                                           connect by regexp_substr(listQuocGia, '[^,]+', 1, level) is not null
                                                       )
                      ))
                      AND (loaiHopDong IS NULL OR CB.IS_HDTN = loaiHopDong)
                      AND (loaiChuyenVien IS NULL OR CB.IS_CVDT = loaiChuyenVien)
                      AND (fromAge IS NULL OR (cb.NGAY_SINH IS NOT NULL AND (SELECT TRUNC(MONTHS_BETWEEN(TRUNC(sysdate),
                                                                                                         (select to_date('19700101', 'YYYYMMDD') + (1 / 24 / 60 / 60 / 1000) * cb.NGAY_SINH
                                                                                                          from dual)) /
                                                                                          12)
                                                                             from dual) >= fromAge))
                      AND (toAge IS NULL OR (cb.NGAY_SINH IS NOT NULL AND (SELECT TRUNC(MONTHS_BETWEEN(TRUNC(sysdate),
                                                                                                       (select to_date('19700101', 'YYYYMMDD') + (1 / 24 / 60 / 60 / 1000) * cb.NGAY_SINH
                                                                                                        from dual)) /
                                                                                        12)
                                                                           from dual) <= toAge))
                      AND (listChuyenNganh IS NULL OR
                           (CB.CHUYEN_NGANH IN (SELECT regexp_substr(listChuyenNganh, '[^,]+', 1, level)
                                                from dual
                                                connect by regexp_substr(listChuyenNganh, '[^,]+', 1, level) is not null)))
                      AND (
                          nhanSuDonVi IS NULL OR nhanSuDonVi = CB.MA_DON_VI
                          )
                      AND (
                                  nhanSuQuyen IS NULL OR
--                         nhanSuQuyen = fwAssignRole.TEN_ROLE
                                  (
                                              nhanSuQuyen IS NOT NULL AND
                                              EXISTS(
                                                      SELECT FWA.ID
                                                      FROM FW_ASSIGN_ROLE FWA
                                                      WHERE FWA.NGUOI_DUOC_GAN = CB.SHCC
                                                        AND FWA.TEN_ROLE = nhanSuQuyen
                                                  )
                                      )
                          )
                  )
                AND (NGAY_NGHI IS NULL OR NGAY_NGHI < time)
                AND (searchTerm = ''
                  OR LOWER(CB.SHCC) LIKE ST
                  OR LOWER(TRIM(CB.HO || ' ' || CB.TEN)) LIKE ST
                  OR LOWER(CB.EMAIL) LIKE ST
                  OR LOWER(CB.CHUYEN_NGANH) LIKE ST
                  OR LOWER(CB.DANH_HIEU) LIKE ST
                  OR LOWER(CB.GHI_CHU) LIKE ST)
              ORDER BY CB.TEN)
        WHERE R BETWEEN (pageNumber - 1) * pageSize + 1 AND pageNumber * pageSize;
    RETURN canbosys;
end;

/
--EndMethod--

CREATE OR REPLACE FUNCTION TCCB_DASHBOARD_GET_DATA(time IN NUMBER, NHAN_SU_DON_VI OUT SYS_REFCURSOR,
                                        QT_DI_NUOC_NGOAI OUT SYS_REFCURSOR,
                                        QT_CONG_TAC_TRONG_NUOC OUT SYS_REFCURSOR, QT_NGHI_PHEP OUT SYS_REFCURSOR,
                                        QT_NGHI_THAI_SAN OUT SYS_REFCURSOR,
                                        NHAN_SU_CONG_TAC OUT SYS_REFCURSOR) RETURN SYS_REFCURSOR
AS
    DATA_CAN_BO SYS_REFCURSOR;
    today       NUMBER(20);
BEGIN
    select (cast(sysdate as date) - cast(to_date('1970-01-01', 'YYYY-MM-DD') as date)) * 86400000 into today from dual;

    OPEN QT_NGHI_PHEP FOR
        SELECT "numOfStaff",
               "mucDich",
               DM_NP.TEN as "tenMucDich"
        FROM (SELECT COUNT(NP.SHCC) as "numOfStaff",
                     NP.LY_DO       as "mucDich",
                     today          AS "today"
              FROM QT_NGHI_PHEP NP
              WHERE NP.BAT_DAU IS NOT NULL
                AND (
                      (time IS NULL AND NP.BAT_DAU <= today AND NP.KET_THUC >= today)
                      OR
                      NP.BAT_DAU >= time
                  )
              GROUP BY NP.LY_DO)
                 LEFT JOIN DM_NGHI_PHEP DM_NP
                           ON "mucDich" = DM_NP.MA;

    OPEN QT_NGHI_THAI_SAN FOR
        SELECT COUNT(NP.SHCC) as "numOfStaff"
        FROM QT_NGHI_THAI_SAN NP
        WHERE NP.BAT_DAU IS NOT NULL
          AND (
                (time IS NULL AND NP.BAT_DAU <= today AND NP.KET_THUC >= today)
                OR
                NP.BAT_DAU >= time
            );

    OPEN DATA_CAN_BO FOR
        SELECT COUNT(CASE WHEN CB.SHCC IS NOT NULL THEN 1 END) AS "tongCB"

        FROM TCHC_CAN_BO CB
        WHERE CB.NGAY_NGHI IS NULL
          AND (time IS NULL OR (CB.NGAY_BAT_DAU_CONG_TAC <= time));

    OPEN NHAN_SU_DON_VI FOR
        SELECT "numOfStaff",
               "maDonVi",
               DV.MA_PL        as "maPL",
               DV.TEN          as "tenDonVi",
               DV.TEN_VIET_TAT as "tenVietTat"
        FROM (SELECT COUNT(CB.SHCC) as "numOfStaff",
                     CB.MA_DON_VI   as "maDonVi"
              FROM TCHC_CAN_BO CB
              WHERE NGAY_NGHI IS NULL
                AND (time IS NULL OR
                     (CB.NGAY_BAT_DAU_CONG_TAC >= time))
              GROUP BY CB.MA_DON_VI)
                 LEFT JOIN DM_DON_VI DV
                           ON "maDonVi" = DV.MA;


    OPEN QT_DI_NUOC_NGOAI FOR
        SELECT "numOfStaff",
               "mucDich",
               MD.MO_TA as "tenMucDich"
        FROM (SELECT COUNT(DNN.SHCC) as "numOfStaff",
                     DNN.MUC_DICH    as "mucDich",
                     today           AS "today"
              FROM QT_DI_NUOC_NGOAI DNN
              WHERE DNN.NGAY_DI IS NOT NULL
                AND (
                      (time IS NULL AND DNN.NGAY_DI <= today AND DNN.NGAY_VE >= today)
                      OR
                      DNN.NGAY_DI >= time
                  )
              GROUP BY DNN.MUC_DICH)
                 LEFT JOIN DM_MUC_DICH_NUOC_NGOAI MD
                           ON "mucDich" = MD.MA;


    OPEN QT_CONG_TAC_TRONG_NUOC FOR
        SELECT "numOfStaff",
               "mucDich",
               MD.MO_TA as "tenMucDich"
        FROM (SELECT COUNT(TN.SHCC) as "numOfStaff",
                     TN.VIET_TAT    as "mucDich"
              FROM QT_CONG_TAC_TRONG_NUOC TN
              WHERE TN.BAT_DAU IS NOT NULL
                AND (
                      (time IS NULL AND TN.BAT_DAU <= today AND TN.KET_THUC >= today)
                      OR
                      TN.BAT_DAU >= time
                  )
              GROUP BY TN.VIET_TAT)
                 LEFT JOIN DM_MUC_DICH_TRONG_NUOC MD
                           ON "mucDich" = MD.MA;

    OPEN NHAN_SU_CONG_TAC FOR
        SELECT CB.NGAY_BAT_DAU_CONG_TAC                            AS "ngayCongTac",
               (CASE WHEN CB.PHAI = '02' THEN 'Nữ' ELSE 'Nam' end) as "gioiTinh",
               CB.NGACH                                            AS "ngach",
               NGACH.TEN                                           AS "tenNgach",
               CB.CHUC_DANH                                        AS "chucDanh",
               CB.MA_DON_VI                                        AS "donVi",
               HV.TEN                                              AS "hocVi",
               CB.NGAY_BIEN_CHE                                    AS "ngayVaoBienChe"
        FROM TCHC_CAN_BO CB
                 LEFT JOIN DM_NGACH_CDNN NGACH ON NGACH.MA = CB.NGACH
                 LEFT JOIN DM_TRINH_DO HV ON HV.MA = CB.HOC_VI
        WHERE NGAY_NGHI IS NULL
          AND (time IS NULL OR
               (CB.NGAY_BAT_DAU_CONG_TAC >= time));

    RETURN DATA_CAN_BO;
END;

/
--EndMethod--

CREATE OR REPLACE FUNCTION TCCB_SUPPORT_REPLY_GET_ALL(maYeuCau IN NUMBER) RETURN SYS_REFCURSOR
AS
    TCCB_SP_REPLY SYS_REFCURSOR;
BEGIN

    OPEN TCCB_SP_REPLY FOR
        SELECT SP.TYPE                                AS "type",
               SP.SHCC                                AS "shcc",
               SP.SHCC_ASSIGN                         AS "shccAssign",
               SP.DATA                                AS "data",
               SP.APPROVED                            AS "approved",
               SP.MODIFIED_DATE                       as "modifiedDate",
               SP.QT                                  as "qt",
               SP.QT_ID                               AS "qtId",

               CB_XULY.HO || ' ' || CB_XULY.TEN       as "canBoXuLy",
               CB_YEUCAU.HO || ' ' || CB_YEUCAU.TEN   as "canBoYeuCau",
               CB_PHANHOI.HO || ' ' || CB_PHANHOI.TEN as "canBoPhanHoi",
               CB_PHANHOI.MA_DON_VI                   AS "donViCanBoPhanHoi",
               RPL.ID                                 as "id",
               RPL.MA_YEU_CAU                         AS "maYeuCau",
               RPL.NOI_DUNG                           AS "noiDung",
               RPL.THOI_GIAN                          AS "thoiGian",
               USR.IMAGE                              AS "avatar"
        FROM TCCB_SUPPORT_REPLY RPL
                 LEFT JOIN TCCB_SUPPORT SP ON SP.ID = RPL.MA_YEU_CAU
                 LEFT JOIN TCHC_CAN_BO CB_YEUCAU ON CB_YEUCAU.SHCC = SP.SHCC
                 LEFT JOIN TCHC_CAN_BO CB_XULY ON CB_XULY.SHCC = SP.SHCC_ASSIGN
                 LEFT JOIN TCHC_CAN_BO CB_PHANHOI ON CB_PHANHOI.SHCC = RPL.NGUOI_PHAN_HOI
                 LEFT JOIN FW_USER USR ON USR.EMAIL = CB_PHANHOI.EMAIL
        WHERE RPL.MA_YEU_CAU = maYeuCau
        ORDER BY RPL.THOI_GIAN DESC;
    RETURN TCCB_SP_REPLY;

end;

/
--EndMethod--

CREATE OR REPLACE FUNCTION TCCB_SUPPORT_SEARCH_PAGE(pageNumber IN OUT NUMBER, pageSize IN OUT NUMBER, filter IN STRING,
                                         searchTerm IN STRING,
                                         totalItem OUT NUMBER, pageTotal OUT NUMBER) RETURN SYS_REFCURSOR
AS
    TCCB_SP    SYS_REFCURSOR;
    ST         STRING(500) := '%' || lower(searchTerm) || '%';
    TYPE_QUERY STRING(10);
    SHCC_QUERY STRING(10);
BEGIN
    SELECT JSON_VALUE(filter, '$.type') INTO TYPE_QUERY FROM DUAL;
    SELECT JSON_VALUE(filter, '$.shcc') INTO SHCC_QUERY FROM DUAL;

    SELECT COUNT(*)
    INTO totalItem
    FROM TCCB_SUPPORT SP
             LEFT JOIN TCHC_CAN_BO CB_YEUCAU ON CB_YEUCAU.SHCC = SP.SHCC
             LEFT JOIN TCHC_CAN_BO CB_XULY ON CB_XULY.SHCC = SP.SHCC_ASSIGN

    WHERE (SHCC_QUERY IS NULL OR SHCC_QUERY = '' OR SHCC_QUERY = CB_YEUCAU.SHCC)
      AND (TYPE_QUERY IS NULL OR
           TYPE_QUERY IS NOT NULL AND SP.TYPE IN (SELECT regexp_substr(TYPE_QUERY, '[^,]+', 1, level)
                                                  from dual
                                                  connect by regexp_substr(TYPE_QUERY, '[^,]+', 1, level) is not null))
      AND (searchTerm = ''
        OR LOWER(CB_YEUCAU.SHCC) LIKE ST
        OR LOWER(TRIM(CB_YEUCAU.HO || ' ' || CB_YEUCAU.TEN)) LIKE ST);

    IF pageNumber < 1 THEN pageNumber := 1; END IF;
    IF pageSize < 1 THEN pageSize := 1; END IF;
    pageTotal := CEIL(totalItem / pageSize);
    pageNumber := LEAST(pageNumber, pageTotal);

    OPEN TCCB_SP FOR
        SELECT *
        FROM (SELECT SP.ID                                AS        "id",
                     SP.TYPE                              AS        "type",
                     SP.SHCC                              AS        "shcc",
                     SP.SHCC_ASSIGN                       AS        "shccAssign",
                     SP.DATA                              AS        "data",
                     SP.APPROVED                          AS        "approved",
                     SP.MODIFIED_DATE                     as        "modifiedDate",
                     SP.QT                                as        "qt",
                     SP.QT_ID                             AS        "qtId",
                     SP.SENT_DATE                         AS        "sentDate",
                     SP.OLD_DATA                          AS        "oldData",
                     CB_XULY.HO || ' ' || CB_XULY.TEN     as        "canBoXuLy",
                     CB_YEUCAU.HO || ' ' || CB_YEUCAU.TEN as        "canBoYeuCau",

                     ROW_NUMBER() OVER (ORDER BY SP.SENT_DATE DESC) R
              FROM TCCB_SUPPORT SP
                       LEFT JOIN TCHC_CAN_BO CB_YEUCAU ON CB_YEUCAU.SHCC = SP.SHCC
                       LEFT JOIN TCHC_CAN_BO CB_XULY ON CB_XULY.SHCC = SP.SHCC_ASSIGN

              WHERE (SHCC_QUERY IS NULL OR SHCC_QUERY = '' OR SHCC_QUERY = CB_YEUCAU.SHCC)
                AND (TYPE_QUERY IS NULL OR
                     TYPE_QUERY IS NOT NULL AND SP.TYPE IN (SELECT regexp_substr(TYPE_QUERY, '[^,]+', 1, level)
                                                            from dual
                                                            connect by regexp_substr(TYPE_QUERY, '[^,]+', 1, level) is not null))
                AND (searchTerm = ''
                  OR LOWER(CB_YEUCAU.SHCC) LIKE ST
                  OR LOWER(TRIM(CB_YEUCAU.HO || ' ' || CB_YEUCAU.TEN)) LIKE ST));
    RETURN TCCB_SP;

end;

/
--EndMethod--

CREATE OR REPLACE FUNCTION TCHC_CAN_BO_GET_DATA_ALL(mtcb IN STRING, QT_CHUC_VU OUT SYS_REFCURSOR, QT_DAO_TAO OUT SYS_REFCURSOR,
                                         QT_HOC_TAP_CONG_TAC OUT SYS_REFCURSOR,
                                         TO_CHUC_KHAC OUT SYS_REFCURSOR,
                                         QUAN_HE_GIA_DINH OUT SYS_REFCURSOR) RETURN SYS_REFCURSOR
AS
    CAN_BO SYS_REFCURSOR;
BEGIN

    OPEN CAN_BO FOR
        SELECT STAFF.SHCC                                             AS "shcc",
               STAFF.HO                                               AS "ho",
               STAFF.TEN                                              AS "ten",
               STAFF.BI_DANH                                          AS "otherName",
               staff.NGAY_SINH                                        as "ngaySinh",
               (CASE WHEN staff.PHAI = '02' THEN 'Nữ' ELSE 'Nam' end) as "gioiTinh",

               xaNoiSinh.TEN_PHUONG_XA                                as "xaNoiSinh",
               huyenNoiSinh.TEN_QUAN_HUYEN                            as "huyenNoiSinh",
               tinhNoiSinh.TEN                                        AS "tinhNoiSinh",

               xaNguyenQuan.TEN_PHUONG_XA                             AS "xaNguyenQuan",
               huyenNguyenQuan.TEN_QUAN_HUYEN                         AS "huyenNguyenQuan",
               tinhNguyenQuan.TEN                                     AS "tinhNguyenQuan",

               danToc.TEN                                             as "danToc",
               tonGiao.TEN                                            as "tonGiao",
               xaThuongTru.TEN_PHUONG_XA                              as "xaThuongTru",
               huyenThuongTru.TEN_QUAN_HUYEN                          as "huyenThuongTru",
               tinhThuongTru.ten                                      as "tinhThuongTru",
               staff.THUONG_TRU_SO_NHA                                as "soNhaThuongTru",

               xaHienTai.TEN_PHUONG_XA                                as "xaHienTai",
               huyenHienTai.TEN_QUAN_HUYEN                            as "huyenHienTai",
               tinhHienTai.ten                                        as "tinhHienTai",
               staff.HIEN_TAI_SO_NHA                                  as "soNhaHienTai",

               staff.NGHE_NGHIEP_CU                                   as "ngheTuyen",
               staff.NGAY_BAT_DAU_CONG_TAC                            as "ngayTuyen",
               staff.DON_VI_TUYEN_DUNG                                as "coQuanTuyen",
               staff.NGACH                                            as "maNgach",
               ngach.TEN                                              as "tenNgach",
               staff.NGAY_HUONG_LUONG                                 as "ngayHuongLuong",
               staff.BAC_LUONG                                        as "bacLuong",
               staff.HE_SO_LUONG                                      as "heSoLuong",
               staff.TRINH_DO_PHO_THONG                               as "phoThong",
               hocVi.TEN                                              as "hocVi",
               staff.NGAY_VAO_DANG                                    as "ngayVaoDang",
               staff.NGAY_VAO_DANG_CHINH_THUC                         as "ngayVaoDangChinhThuc",
               staff.NGAY_NHAP_NGU                                    as "ngayNhapNgu",
               staff.NGAY_XUAT_NGU                                    as "ngayXuatNgu",
               staff.QUAN_HAM_CAO_NHAT                                as "quanHam",
               staff.SO_TRUONG                                        as "soTruong",
               staff.SUC_KHOE                                         as "sucKhoe",
               staff.CHIEU_CAO                                        as "chieuCao",
               staff.CAN_NANG                                         as "canNang",
               nhomMau.TEN                                            as "nhomMau",
               staff.HANG_THUONG_BINH                                 as "hangThuongBinh",
               staff.GIA_DINH_CHINH_SACH                              as "giaDinhChinhSach",
               staff.CMND                                             as "cmnd",
               staff.CMND_NGAY_CAP                                    as "ngayCapCmnd",
               staff.CMND_NOI_CAP                                     as "noiCapCmnd",
               staff.SO_BHXH                                          as "soBaoHiemXaHoi",
               chucDanh.TEN                                           AS "chucDanh",
               staff.NAM_CHUC_DANH                                    AS "namChucDanh",

               (select rtrim(xmlagg(xmlelement(e, daoTao.CHUYEN_NGANH, ' - ', daoTao.TRINH_DO, ', ').extract('//text()')
                                    order by
                                    null).getclobval(), ', ')
                FROM QT_DAO_TAO daoTao
                         LEFT JOIN DM_BANG_DAO_TAO bdt on daoTao.LOAI_BANG_CAP = bdt.MA
                WHERE daoTao.SHCC = mtcb
                  AND daoTao.LOAI_BANG_CAP = 5)                       AS "ngoaiNgu"
        FROM TCHC_CAN_BO STAFF
                 LEFT JOIN DM_PHUONG_XA xaNoiSinh
                           ON STAFF.MA_XA_NOI_SINH = xaNoiSinh.MA_PHUONG_XA
                 LEFT JOIN DM_QUAN_HUYEN huyenNoiSinh ON huyenNoiSinh.MA_QUAN_HUYEN = STAFF.MA_HUYEN_NOI_SINH
                 LEFT JOIN DM_TINH_THANH_PHO tinhNoiSinh ON STAFF.MA_TINH_NOI_SINH = tinhNoiSinh.MA
                 LEFT JOIN DM_PHUONG_XA xaNguyenQuan ON STAFF.MA_XA_NGUYEN_QUAN = xaNguyenQuan.MA_PHUONG_XA
                 LEFT JOIN DM_QUAN_HUYEN huyenNguyenQuan ON STAFF.MA_HUYEN_NGUYEN_QUAN = huyenNguyenQuan.MA_QUAN_HUYEN
                 LEFT JOIN DM_TINH_THANH_PHO tinhNguyenQuan ON STAFF.MA_TINH_NGUYEN_QUAN = tinhNguyenQuan.MA
                 LEFT JOIN DM_DAN_TOC danToc ON STAFF.DAN_TOC = danToc.MA
                 LEFT JOIN DM_TON_GIAO tonGiao ON STAFF.TON_GIAO = tonGiao.MA
                 LEFT JOIN DM_PHUONG_XA xaThuongTru ON STAFF.THUONG_TRU_MA_XA = xaThuongTru.MA_PHUONG_XA
                 LEFT JOIN DM_QUAN_HUYEN huyenThuongTru ON STAFF.THUONG_TRU_MA_HUYEN = huyenThuongTru.MA_QUAN_HUYEN
                 LEFT JOIN DM_TINH_THANH_PHO tinhThuongTru ON STAFF.THUONG_TRU_MA_TINH = tinhThuongTru.MA
                 LEFT JOIN DM_PHUONG_XA xaHienTai ON STAFF.HIEN_TAI_MA_XA = xaHienTai.MA_PHUONG_XA
                 LEFT JOIN DM_QUAN_HUYEN huyenHienTai ON STAFF.HIEN_TAI_MA_HUYEN = huyenHienTai.MA_QUAN_HUYEN
                 LEFT JOIN DM_TINH_THANH_PHO tinhHienTai ON STAFF.HIEN_TAI_MA_TINH = tinhHienTai.MA
                 LEFT JOIN DM_NGACH_CDNN ngach ON ngach.MA = staff.NGACH
                 left join DM_TRINH_DO hocVi ON hocVi.MA = staff.HOC_VI
                 LEFT JOIN DM_NHOM_MAU nhomMau ON nhomMau.MA = staff.NHOM_MAU
                 LEFT JOIN DM_CHUC_DANH_KHOA_HOC chucDanh ON chucDanh.MA = staff.CHUC_DANH

        WHERE STAFF.SHCC = mtcb;

    OPEN QT_CHUC_VU FOR
        SELECT DM_DON_VI.TEN      AS "donVi",
               DM_CHUC_VU.TEN     AS "chucVu",
               DM_CHUC_VU.PHU_CAP as "phuCapChucVu",
               cv.CHUC_VU_CHINH   AS "chucVuChinh"
        FROM QT_CHUC_VU cv
                 LEFT JOIN DM_CHUC_VU ON DM_CHUC_VU.MA = CV.MA_CHUC_VU
                 LEFT JOIN DM_DON_VI ON DM_DON_VI.MA = CV.MA_DON_VI
                 LEFT JOIN DM_BO_MON ON DM_BO_MON.MA = CV.MA_BO_MON
        WHERE cv.SHCC = mtcb
          and cv.THOI_CHUC_VU = 0;

    OPEN QUAN_HE_GIA_DINH FOR
        SELECT quanhe.HO_TEN       AS "hoTen",
               quanhe.NAM_SINH     AS "namSinh",
               quanhe.NGHE_NGHIEP  AS "ngheNghiep",
               quanhe.NOI_CONG_TAC AS "noiCongTac",
               qh.TEN              AS "moiQuanHe",
               qh.LOAI             AS "loai"
        FROM QUAN_HE_CAN_BO quanhe
                 LEFT JOIN DM_QUAN_HE_GIA_DINH qh ON quanhe.MOI_QUAN_HE = qh.MA
        WHERE quanhe.SHCC = mtcb;

    OPEN QT_HOC_TAP_CONG_TAC FOR
        SELECT HTCT.BAT_DAU       as "batDau",
               HTCT.KET_THUC_TYPE as "ketThucType",
               HTCT.KET_THUC      as "ketThuc",
               htct.BAT_DAU_TYPE  as "batDauType",
               HTCT.NOI_DUNG      as "noiDung"
        FROM QT_HOC_TAP_CONG_TAC HTCT
        where htct.SHCC = mtcb;

    open TO_CHUC_KHAC FOR
        SELECT tck.NGAY_THAM_GIA as "ngayThamGia",
               tck.TEN_TO_CHUC   as "tenToChuc",
               tck.MO_TA         as "moTa"
        FROM TCCB_TO_CHUC_KHAC TCK
        where tck.SHCC = mtcb;

    open QT_DAO_TAO for
        select qtdt.TEN_TRUONG    as "coSo",
               qtdt.CHUYEN_NGANH  as "chuyenNganh",
               qtdt.BAT_DAU       as "batDau",
               qtdt.BAT_DAU_TYPE  as "batDauType",
               qtdt.KET_THUC      as "ketThuc",
               qtdt.KET_THUC_TYPE as "ketThucType",
               qtdt.HINH_THUC     as "hinhThuc",
               qtdt.LOAI_BANG_CAP as "loaiBangCap",
               qtdt.TRINH_DO      as "trinhDo",
               bdt.TEN            as "tenLoaiBangCap",
               htdt.TEN           as "tenHinhThuc",
               TDDT.TEN           AS "tenTrinhDo"
        from QT_DAO_TAO qtdt
                 LEFT JOIN DM_BANG_DAO_TAO bdt on qtdt.LOAI_BANG_CAP = bdt.MA
                 LEFT JOIN DM_HINH_THUC_DAO_TAO htdt on qtdt.HINH_THUC = htdt.MA
                 LEFT JOIN DM_TRINH_DO_DAO_TAO TDDT ON TDDT.MA = qtdt.TRINH_DO
        where qtdt.SHCC = mtcb
          AND qtdt.KET_THUC != -1;

    return CAN_BO;
END;

/
--EndMethod--

CREATE OR REPLACE FUNCTION TCHC_CAN_BO_GET_GIANG_VIEN(searchTerm IN STRING) RETURN SYS_REFCURSOR
AS
    my_cursor SYS_REFCURSOR;
    sT        STRING(502) := '%' || lower(searchTerm) || '%';
BEGIN
    OPEN my_cursor FOR
        SELECT *
        FROM (
                 SELECT CB.SHCC     AS "shcc",
                        CB.HO       AS "ho",
                        CB.TEN      AS "ten",
                        DV.TEN      AS "tenDonVi",
                        TD.VIET_TAT AS "trinhDo"
                 FROM TCHC_CAN_BO CB
                          LEFT JOIN DM_NGACH_CDNN NGACH on CB.NGACH = NGACH.MA
                          LEFT JOIN DM_DON_VI DV on CB.MA_DON_VI = DV.MA
                          LEFT JOIN DM_TRINH_DO TD ON TD.MA = CB.HOC_VI
                 WHERE NGACH.NHOM = 1
                   AND (searchTerm = ''
                     OR LOWER(TRIM(CB.HO || ' ' || CB.TEN)) LIKE sT
                     OR LOWER(TRIM(CB.SHCC)) LIKE sT)
                 ORDER BY CB.MA_DON_VI
             );
    RETURN my_cursor;

end;

/
--EndMethod--

CREATE OR REPLACE FUNCTION TC_HOC_PHI_GET_ALL_MSSV(iMssv IN STRING, hocPhiDetailAll OUT SYS_REFCURSOR) RETURN SYS_REFCURSOR
AS
    my_cursor SYS_REFCURSOR;
BEGIN
    OPEN hocPhiDetailAll FOR
        SELECT HPD.MSSV     AS "mssv",
               HPD.LOAI_PHI AS "loaiPhi",

               HPD.HOC_KY   AS "hocKy",
               HPD.NAM_HOC  AS "namHoc",
               HPD.SO_TIEN  AS "soTien",
               LP.TEN       AS "tenLoaiPhi"
        FROM TC_HOC_PHI_DETAIL HPD
                 LEFT JOIN FW_STUDENT ST ON HPD.MSSV = ST.MSSV
                 LEFT JOIN TC_LOAI_PHI LP ON LP.ID = HPD.LOAI_PHI
                 LEFT JOIN DM_DON_VI DV ON DV.MA = ST.KHOA
        WHERE HPD.MSSV = iMssv
        ORDER BY NAM_HOC DESC, HOC_KY DESC;

    OPEN my_cursor FOR
        SELECT HP.MSSV    AS "mssv",
               HP.NAM_HOC as "namHoc",
               HP.HOC_KY  as "hocKy",
               hp.HOC_PHI as "hocPhi",
               hp.CONG_NO as "congNo"
        FROM TC_HOC_PHI HP
        WHERE HP.MSSV = iMssv
        ORDER BY NAM_HOC DESC, HOC_KY DESC;

    RETURN my_cursor;
END ;

/
--EndMethod--

CREATE OR REPLACE FUNCTION TC_HOC_PHI_SANDBOX_SEARCH_PAGE(pageNumber IN OUT NUMBER, pageSize IN OUT NUMBER, imssv IN STRING,
                                       searchTerm IN STRING, filter IN STRING,
                                       totalItem OUT NUMBER, pageTotal OUT NUMBER) RETURN SYS_REFCURSOR
AS
    my_cursor SYS_REFCURSOR;
    sT        STRING(502) := '%' || lower(searchTerm) || '%';
    namHoc    NUMBER(4);
    hocKy     NUMBER(1);
BEGIN
    SELECT JSON_VALUE(filter, '$.namHoc') INTO namHoc FROM DUAL;
    SELECT JSON_VALUE(filter, '$.hocKy') INTO hocKy FROM DUAL;

    SELECT COUNT(*)
    INTO totalItem
    FROM TC_HOC_PHI_SANDBOX HP
             LEFT JOIN FW_STUDENT FS on HP.MSSV = FS.MSSV
    WHERE (imssv IS NULL OR imssv = '' OR imssv = HP.MSSV) AND
          (NAM_HOC = namHoc AND HOC_KY = hocKy)
      AND (searchTerm = ''
        OR LOWER(TRIM(FS.HO || ' ' || FS.TEN)) LIKE sT);

    IF pageNumber < 1 THEN pageNumber := 1; END IF;
    IF pageSize < 1 THEN pageSize := 1; END IF;
    pageTotal := CEIL(totalItem / pageSize);
    pageNumber := LEAST(pageNumber, pageTotal);

    OPEN my_cursor FOR
        SELECT *
        FROM (SELECT HP.MSSV                  AS         "mssv",
                     HP.NAM_HOC               AS         "namHoc",
                     HP.HOC_KY                AS         "hocKy",
                     HP.CONG_NO               AS         "congNo",
                     HP.HOC_PHI               AS         "hocPhi",
                     (FS.HO || ' ' || FS.TEN) AS         "hoTenSinhVien",
                     ROW_NUMBER() OVER (ORDER BY FS.TEN) R
              FROM TC_HOC_PHI_SANDBOX HP
                       LEFT JOIN FW_STUDENT FS on HP.MSSV = FS.MSSV
              WHERE (imssv IS NULL OR imssv = '' OR imssv = HP.MSSV) AND
                    (NAM_HOC = namHoc AND HOC_KY = hocKy)
                AND (searchTerm = ''
                  OR LOWER(TRIM(FS.HO || ' ' || FS.TEN)) LIKE sT))
        WHERE R BETWEEN (pageNumber - 1) * pageSize + 1 AND pageNumber * pageSize;
    RETURN my_cursor;
END ;

/
--EndMethod--

CREATE OR REPLACE FUNCTION TC_HOC_PHI_SEARCH_PAGE(pageNumber IN OUT NUMBER, pageSize IN OUT NUMBER, imssv IN STRING,
                                       searchTerm IN STRING, filter IN STRING,
                                       totalItem OUT NUMBER, pageTotal OUT NUMBER, totalCurrent OUT NUMBER,
                                       totalPaid OUT NUMBER) RETURN SYS_REFCURSOR
AS
    my_cursor SYS_REFCURSOR;
    sT        STRING(502) := '%' || lower(searchTerm) || '%';
    namHoc    NUMBER(4);
    hocKy     NUMBER(1);
    daDong    NUMBER(1);
BEGIN
    SELECT JSON_VALUE(filter, '$.namHoc') INTO namHoc FROM DUAL;
    SELECT JSON_VALUE(filter, '$.hocKy') INTO hocKy FROM DUAL;
    SELECT JSON_VALUE(filter, '$.daDong') INTO daDong FROM DUAL;

    SELECT COUNT(*)
    INTO totalItem
    FROM TC_HOC_PHI HP
             LEFT JOIN FW_STUDENT FS on HP.MSSV = FS.MSSV
    WHERE (imssv IS NULL OR imssv = '' OR imssv = HP.MSSV)
      AND (
            daDong IS NULL OR daDong = ''
            OR daDong = 1 AND HP.CONG_NO = 0
            OR daDong = 0
        )
      AND (NAM_HOC = namHoc AND HOC_KY = hocKy)
      AND (searchTerm = ''
        OR LOWER(TRIM(FS.HO || ' ' || FS.TEN)) LIKE sT);

    SELECT COUNT(*)
    INTO totalCurrent
    FROM TC_HOC_PHI HP
    WHERE NAM_HOC = namHoc
      AND HOC_KY = hocKy;

    SELECT COUNT(*)
    INTO totalPaid
    FROM TC_HOC_PHI HP
    WHERE NAM_HOC = namHoc
      AND HOC_KY = hocKy
      AND HP.CONG_NO = 0;

    IF pageNumber < 1 THEN pageNumber := 1; END IF;
    IF pageSize < 1 THEN pageSize := 1; END IF;
    pageTotal := CEIL(totalItem / pageSize);
    pageNumber := LEAST(pageNumber, pageTotal);

    OPEN my_cursor FOR
        SELECT *
        FROM (SELECT HP.MSSV                  AS         "mssv",
                     HP.NAM_HOC               AS         "namHoc",
                     HP.HOC_KY                AS         "hocKy",
                     HP.CONG_NO               AS         "congNo",
                     HP.HOC_PHI               AS         "hocPhi",
                     (FS.HO || ' ' || FS.TEN) AS         "hoTenSinhVien",
                     ROW_NUMBER() OVER (ORDER BY FS.TEN) R
              FROM TC_HOC_PHI HP
                       LEFT JOIN FW_STUDENT FS on HP.MSSV = FS.MSSV
              WHERE (imssv IS NULL OR imssv = '' OR imssv = HP.MSSV)
                AND (
                      daDong IS NULL OR daDong = ''
                      OR daDong = 1 AND HP.CONG_NO = 0
                      OR daDong = 0
                  )
                AND (NAM_HOC = namHoc AND HOC_KY = hocKy)
                AND (searchTerm = ''
                  OR LOWER(TRIM(FS.HO || ' ' || FS.TEN)) LIKE sT))
        WHERE R BETWEEN (pageNumber - 1) * pageSize + 1 AND pageNumber * pageSize;
    RETURN my_cursor;
END ;

/
--EndMethod--

CREATE OR REPLACE FUNCTION TC_HOC_PHI_TRANSACTION_ADD_BILL(namHoc IN STRING, hocKy IN STRING, eBank IN STRING, transId IN STRING, transDate IN STRING, customerId IN STRING, billId IN STRING, serviceId IN STRING, eAmount IN NUMBER, eChecksum IN STRING) RETURN NUMBER
AS
    DA_DONG NUMBER;
BEGIN
    INSERT INTO TC_HOC_PHI_TRANSACTION (BANK, TRANS_ID, TRANS_DATE, CUSTOMER_ID, BILL_ID, SERVICE_ID, AMOUNT, CHECKSUM, NAM_HOC, HOC_KY, STATUS)
        VALUES (eBank, transId, transDate, customerId, billId, serviceId, eAmount, eChecksum, namHoc, hocKy, 1);

    SELECT SUM(T.AMOUNT) INTO DA_DONG FROM TC_HOC_PHI_TRANSACTION T WHERE T.NAM_HOC=namHoc AND T.HOC_KY=hocKy AND T.CUSTOMER_ID=customerId AND T.STATUS=1;

    IF DA_DONG IS NULL THEN
        UPDATE TC_HOC_PHI_TRANSACTION T SET T.STATUS=0 WHERE T.TRANS_ID=transId;
        return 0;
    ELSE
        UPDATE TC_HOC_PHI T SET T.CONG_NO=T.HOC_PHI-DA_DONG WHERE T.NAM_HOC=namHoc AND T.HOC_KY=hocKy AND T.MSSV=customerId;
        COMMIT;
        return 1;
    END IF;
END;

/
--EndMethod--

CREATE OR REPLACE FUNCTION TC_HOC_PHI_TRANSACTION_SANDBOX_ADD_BILL(namHoc IN STRING, hocKy IN STRING, eBank IN STRING, transId IN STRING, transDate IN STRING, customerId IN STRING, billId IN STRING, serviceId IN STRING, eAmount IN NUMBER, eChecksum IN STRING) RETURN NUMBER
AS
    DA_DONG NUMBER;
BEGIN
    INSERT INTO TC_HOC_PHI_TRANSACTION_SANDBOX (BANK, TRANS_ID, TRANS_DATE, CUSTOMER_ID, BILL_ID, SERVICE_ID, AMOUNT, CHECKSUM, NAM_HOC, HOC_KY, STATUS)
        VALUES (eBank, transId, transDate, customerId, billId, serviceId, eAmount, eChecksum, namHoc, hocKy, 1);

    SELECT SUM(T.AMOUNT) INTO DA_DONG FROM TC_HOC_PHI_TRANSACTION_SANDBOX T WHERE T.NAM_HOC=namHoc AND T.HOC_KY=hocKy AND T.CUSTOMER_ID=customerId AND T.STATUS=1;

    IF DA_DONG IS NULL THEN
        UPDATE TC_HOC_PHI_TRANSACTION_SANDBOX T SET T.STATUS=0 WHERE T.TRANS_ID=transId;
        return 0;
    ELSE
        UPDATE TC_HOC_PHI_SANDBOX T SET T.CONG_NO=T.HOC_PHI-DA_DONG WHERE T.NAM_HOC=namHoc AND T.HOC_KY=hocKy AND T.MSSV=customerId;
        COMMIT;
        return 1;
    END IF;
END;

/
--EndMethod--

CREATE OR REPLACE FUNCTION TEST_SEARCH_PAGE(filter IN STRING) RETURN SYS_REFCURSOR
AS
    SYS SYS_REFCURSOR;
BEGIN
    OPEN SYS FOR
        SELECT * FROM
        (
            SELECT value AS "value" FROM (SELECT JSON_VALUE(filter, '$.name') AS value FROM dual)
        );
    RETURN SYS;
end;

/
--EndMethod--

CREATE OR REPLACE FUNCTION TRINH_DO_NGOAI_NGU_BY_SHCC(isSHCC in STRING) RETURN SYS_REFCURSOR
AS
    cur SYS_REFCURSOR;
BEGIN
    OPEN cur FOR
        SELECT
               tdnn.ID AS "id",
               tdnn.SHCC AS "shcc",
               tdnn.LOAI_NGON_NGU AS "loaiNgonNgu",
               dmnn.TEN AS "tenLoaiNgonNgu",
               tdnn.TRINH_DO AS "trinhDo"
        FROM TRINH_DO_NGOAI_NGU tdnn
                 LEFT JOIN DM_NGOAI_NGU dmnn ON dmnn.MA = tdnn.LOAI_NGON_NGU
        WHERE isSHCC = tdnn.SHCC;
    return cur;
END;

/
--EndMethod--

