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

DROP FUNCTION DT_LICH_PHONG;
/
--EndMethod--

CREATE OR REPLACE FUNCTION DT_THOI_KHOA_BIEU_SEARCH_PAGE(pageNumber IN OUT NUMBER, pageSize IN OUT NUMBER, searchTerm IN STRING,
                                              totalItem OUT NUMBER, pageTotal OUT NUMBER) RETURN SYS_REFCURSOR
AS
    my_cursor SYS_REFCURSOR;
    sT        STRING(502) := '%' || lower(searchTerm) || '%';
BEGIN
    SELECT COUNT(*)
    INTO totalItem
    FROM DT_THOI_KHOA_BIEU TKB
             LEFT JOIN DM_DON_VI DV1 ON DV1.MA = TKB.KHOA_DANG_KY
             LEFT JOIN DM_MON_HOC DMMH ON DMMH.MA = TKB.MA_MON_HOC
             LEFT JOIN DM_DON_VI DV ON DV.MA = DMMH.KHOA
             LEFT JOIN TCHC_CAN_BO CB on TKB.GIANG_VIEN = CB.SHCC
             LEFT JOIN DT_NGANH_DAO_TAO NDT on TKB.MA_NGANH = NDT.MA_NGANH

    WHERE searchTerm = ''
       OR LOWER(TRIM(DMMH.TEN)) LIKE sT
       OR LOWER(TRIM(DV.TEN)) LIKE sT
       OR LOWER(TRIM(TKB.MA_MON_HOC)) LIKE sT
       OR LOWER(TRIM(TKB.HOC_KY)) LIKE sT
       OR LOWER('thứ' || ' ' || TRIM(TKB.THU)) LIKE lower(searchTerm)
       OR LOWER(TRIM(TKB.PHONG)) LIKE lower(searchTerm)
       OR LOWER(TRIM(CB.HO || ' ' || CB.TEN)) LIKE sT;

    IF pageNumber < 1 THEN pageNumber := 1; END IF;
    IF pageSize < 1 THEN pageSize := 1; END IF;
    pageTotal := CEIL(totalItem / pageSize);
    pageNumber := LEAST(pageNumber, pageTotal);

    OPEN my_cursor FOR
        SELECT *
        FROM (SELECT TKB.ID               AS              "id",
                     TKB.PHONG            AS              "phong",
                     TKB.THU              AS              "thu",
                     TKB.TIET_BAT_DAU     AS              "tietBatDau",
                     TKB.SO_TIET          AS              "soTiet",
                     TKB.HOC_KY           AS              "hocKy",
                     TKB.NAM              AS              "nam",
                     TKB.MA_MON_HOC       AS              "maMonHoc",
                     TKB.NGAY_BAT_DAU     AS              "ngayBatDau",
                     TKB.NHOM             AS              "nhom",
                     TKB.SO_LUONG_DU_KIEN AS              "soLuongDuKien",
                     DV.TEN               AS              "tenKhoaBoMon",
                     DV.MA                AS              "maKhoaBoMon",
                     DMMH.TEN             AS              "tenMonHoc",
                     DV1.TEN              AS              "tenKhoaDangKy",
                     CB.HO                AS              "hoGiangVien",
                     CB.TEN               AS              "tenGiangVien",
                     TKB.GIANG_VIEN       as              "giangVien",
                     TD.VIET_TAT          AS              "trinhDo",
                     TKB.SUC_CHUA         AS              "sucChua",
                     TKB.MA_NGANH         AS              "maNganh",
                     NDT.TEN_NGANH        AS              "tenNganh",
                     TKB.BUOI             AS              "buoi",
                     ROW_NUMBER() OVER (ORDER BY TKB.THU) R
              FROM DT_THOI_KHOA_BIEU TKB
                       LEFT JOIN DM_DON_VI DV1 ON DV1.MA = TKB.KHOA_DANG_KY
                       LEFT JOIN DM_MON_HOC DMMH ON DMMH.MA = TKB.MA_MON_HOC
                       LEFT JOIN DM_DON_VI DV ON DV.MA = DMMH.KHOA
                       LEFT JOIN TCHC_CAN_BO CB on TKB.GIANG_VIEN = CB.SHCC
                       LEFT JOIN DM_NGACH_CDNN NGACH on CB.NGACH = NGACH.MA
                       LEFT JOIN DM_TRINH_DO TD ON TD.MA = CB.HOC_VI
                       LEFT JOIN DT_NGANH_DAO_TAO NDT on TKB.MA_NGANH = NDT.MA_NGANH
              WHERE searchTerm = ''
                 OR LOWER(TRIM(DMMH.TEN)) LIKE sT
                 OR LOWER(TRIM(DV.TEN)) LIKE sT
                 OR LOWER(TRIM(TKB.MA_MON_HOC)) LIKE sT
                 OR LOWER(TRIM(TKB.HOC_KY)) LIKE sT
                 OR LOWER('thứ' || ' ' || TRIM(TKB.THU)) LIKE lower(searchTerm)
                 OR LOWER(TRIM(TKB.PHONG)) LIKE lower(searchTerm)
                 OR LOWER(TRIM(CB.HO || ' ' || CB.TEN)) LIKE sT
              ORDER BY TKB.THU, TKB.KHOA_DANG_KY)
        WHERE R BETWEEN (pageNumber - 1) * pageSize + 1 AND pageNumber * pageSize;
    RETURN my_cursor;
END ;

/
--EndMethod--

CREATE OR REPLACE FUNCTION HCTH_CONG_VAN_DI_SEARCH_PAGE(
    pageNumber IN OUT NUMBER,
    pageSize IN OUT NUMBER,
    maCanBo IN STRING,
    donViGui IN NUMBER,
    donVi IN NUMBER,
    loaiCongVan IN NUMBER,
    donViNhanNgoai IN NUMBER,
    donViXem IN STRING,
    canBoXem IN STRING,
    loaiCanBo IN NUMBER,
    congVanLaySo IN NUMBER,
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
                (
                      (
                                  donViGui IS NULL
                              AND donVi IS NULL
                              AND maCanBo IS NULL
                              AND donViNhanNgoai IS NULL
                          )
                      OR (
                                  donViGui IS NOT NULL
                              AND donViGui = hcthCVD.DON_VI_GUI
                          )
                      OR (
                                  maCanBo IS NOT NULL
                              AND maCanBo IN
                                  (SELECT regexp_substr(hcthCVD.CAN_BO_NHAN, '[^,]+', 1, level)
                                   from dual
                                   connect by regexp_substr(hcthCVD.CAN_BO_NHAN, '[^,]+', 1, level) is NOT NULL
                                  )
                          )
                      OR (
                                  donVi IS NOT NULL
                              AND EXISTS(
                                    SELECT hcthDVN.id
                                    FROM HCTH_DON_VI_NHAN hcthDVN
                                    WHERE hcthDVN.MA = hcthCVD.ID
                                    AND hcthDVN.LOAI = 'DI'
                                    AND hcthDVN.DON_VI_NHAN IN (
                                            select regexp_substr(donVi, '[^,]+', 1, level)
                                            from dual
                                            connect by regexp_substr(donVi, '[^,]+', 1, level) is not null
                                        )
                                    )
                          )
                      OR (
                                  donViNhanNgoai IS NOT NULL
                              AND donViNhanNgoai IN
                                  (
                                      SELECT regexp_substr(hcthCVD.DON_VI_NHAN_NGOAI, '[^,]+', 1, level)
                                      from dual
                                      connect by regexp_substr(hcthCVD.DON_VI_NHAN_NGOAI, '[^,]+', 1, level) is NOT NULL
                                                 )
                          )
                      )
                  AND (
                            loaiCongVan IS NULL
                          OR (
                                  (
                                              loaiCongVan = 1
                                          AND hcthCVD.NOI_BO IS NOT NULL
                                          AND hcthCVD.NOI_BO = 1
                                      )
                                  OR (
                                              loaiCongVan = 2
                                          AND hcthCVD.NOI_BO IS NOT NULL
                                          AND hcthCVD.NOI_BO = 0
                                      )
                              )
                      )
                  AND (
                            congVanLaySo IS NULL
                        OR (
                                (
                                        congVanLaySo = 1
                                    AND hcthCVD.LAY_SO IS NOT NULL
                                    AND hcthCVD.LAY_SO = 1
                                    )
                                OR (
                                        congVanLaySo = 2
                                    AND hcthCVD.LAY_SO IS NOT NULL
                                    AND hcthCVD.LAY_SO = 0
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
                                        hcthCVD.TRANG_THAI != '1'
                                        OR (
                                            hcthCVD.TRANG_THAI = '1'
                                            AND hcthCVD.DON_VI_GUI = '29'
                                            )
                                        OR hcthCVD.TRANG_THAI IS NULL
                                        )
                                )
                      )
                  AND (
                              ST = ''
                          OR LOWER(hcthCVD.TRICH_YEU) LIKE ST
                          OR LOWER(dvg.TEN) LIKE ST
                      )
              );

    IF pageNumber < 1 THEN pageNumber := 1; END IF;
    IF pageSize < 1 THEN pageSize := 1; END IF;
    pageTotal := CEIL(totalItem / pageSize);
    pageNumber := LEAST(pageNumber, pageTotal);

    OPEN CVD_INFO FOR
        SELECT *
        FROM (
                 SELECT hcthCVD.ID                AS                 "id",
                        hcthCVD.TRICH_YEU         AS                 "trichYeu",
                        hcthCVD.NGAY_GUI          AS                 "ngayGui",
                        hcthCVD.NGAY_KY           AS                 "ngayKy",
                        hcthCVD.CAN_BO_NHAN       AS                 "maCanBoNhan",
                        hcthCVD.NOI_BO            AS                 "noiBo",
                        hcthCVD.TRANG_THAI        AS                 "trangThai",
                        hcthCVD.DON_VI_NHAN_NGOAI AS                 "donViNhanNgoai",
                        hcthCVD.SO_DI             AS                 "soDi",
                        hcthCVD.LOAI_CONG_VAN     AS                 "loaiCongVan",
                        dvg.MA                    AS                 "maDonViGui",
                        dvg.TEN                   AS                 "tenDonViGui",
                        dvg.TEN_VIET_TAT         AS                 "tenVietTatDonViGui",

                        (
                            SELECT LISTAGG(hcthDVN.DON_VI_NHAN, ',') WITHIN GROUP (
                                    ORDER BY hcthDVN.ID
                                )
                            FROM HCTH_DON_VI_NHAN hcthDVN
                            WHERE hcthDVN.MA = hcthCVD.ID
                            AND hcthDVN.LOAI = 'DI'
                        )   AS "maDonViNhan",

                        (
                            SELECT LISTAGG(dvn.TEN, '; ') WITHIN GROUP (
                                ORDER BY dvn.TEN
                                )
                            FROM DM_DON_VI dvn
                                LEFT JOIN HCTH_DON_VI_NHAN hcthDVN ON dvn.MA = hcthDVN.DON_VI_NHAN
                            WHERE hcthDVN.MA = hcthCVD.ID
                            AND hcthDVN.LOAI = 'DI'
                        ) AS "danhSachDonViNhan",

                        CASE
                            WHEN hcthCVD.DON_VI_NHAN_NGOAI IS NULL then NULL
                            ELSE (
                                SELECT LISTAGG(dvn.TEN, '; ') WITHIN GROUP (
                                    order by dvn.TEN
                                    )
                                FROM DM_DON_VI_GUI_CV dvn
                                WHERE (
                                              (
                                                  SELECT Count(*)
                                                  from (
                                                           select to_number(column_value) as IDs
                                                           from xmltable(hcthCVD.DON_VI_NHAN_NGOAI)
                                                       )
                                                  where IDs = dvn.ID
                                              ) != 0
                                          )
                            )
                            END                   AS                 "danhSachDonViNhanNgoai",

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
                                ) END             AS                 "danhSachCanBoNhan",

                        CASE
                            when hcthCVD.LOAI_CONG_VAN is not null then
                            (
                                SELECT TEN_VIET_TAT
                                FROM DM_LOAI_CONG_VAN
                                WHERE ID=hcthCVD.LOAI_CONG_VAN
                            ) END AS "tenVietTatLoaiCongVanDi",

                    ROW_NUMBER() OVER (ORDER BY hcthCVD.ID DESC) R
                 FROM HCTH_CONG_VAN_DI hcthCVD
                          LEFT JOIN DM_DON_VI dvg on (hcthCVD.DON_VI_GUI = dvg.MA)
                 WHERE (
                        (
                              (
                                          donViGui IS NULL
                                      AND donVi IS NULL
                                      AND maCanBo IS NULL
                                      AND donViNhanNgoai IS NULL
                                  )
                              OR (
                                          donViGui IS NOT NULL
                                      AND donViGui = hcthCVD.DON_VI_GUI
                                  )
                              OR (
                                          maCanBo IS NOT NULL
                                      AND maCanBo IN
                                          (SELECT regexp_substr(hcthCVD.CAN_BO_NHAN, '[^,]+', 1, level)
                                           from dual
                                           connect by regexp_substr(hcthCVD.CAN_BO_NHAN, '[^,]+', 1, level) is NOT NULL
                                          )
                                  )
                              OR (
                                          donVi IS NOT NULL
                                      AND EXISTS(
                                            SELECT hcthDVN.id
                                            FROM HCTH_DON_VI_NHAN hcthDVN
                                            WHERE hcthDVN.MA = hcthCVD.ID
                                            AND hcthDVN.LOAI = 'DI'
                                            AND hcthDVN.DON_VI_NHAN IN (
                                                    select regexp_substr(donVi, '[^,]+', 1, level)
                                                    from dual
                                                    connect by regexp_substr(donVi, '[^,]+', 1, level) is not null
                                                )
                                            )
                                  )
                              OR (
                                          donViNhanNgoai IS NOT NULL
                                      AND donViNhanNgoai IN
                                          (
                                              SELECT regexp_substr(hcthCVD.DON_VI_NHAN_NGOAI, '[^,]+', 1, level)
                                              from dual
                                              connect by regexp_substr(hcthCVD.DON_VI_NHAN_NGOAI, '[^,]+', 1, level) is NOT NULL
                                                         )
                                  )
                              )
                          AND (
                                    loaiCongVan IS NULL
                                  OR (
                                          (
                                                      loaiCongVan = 1
                                                  AND hcthCVD.NOI_BO IS NOT NULL
                                                  AND hcthCVD.NOI_BO = 1
                                              )
                                          OR (
                                                      loaiCongVan = 2
                                                  AND hcthCVD.NOI_BO IS NOT NULL
                                                  AND hcthCVD.NOI_BO = 0
                                              )
                                      )
                              )
                          AND (
                                    congVanLaySo IS NULL
                                OR (
                                        (
                                                congVanLaySo = 1
                                            AND hcthCVD.LAY_SO IS NOT NULL
                                            AND hcthCVD.LAY_SO = 1
                                            )
                                        OR (
                                                congVanLaySo = 2
                                            AND hcthCVD.LAY_SO IS NOT NULL
                                            AND hcthCVD.LAY_SO = 0
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
                                                hcthCVD.TRANG_THAI != '1'
                                                OR (
                                                    hcthCVD.TRANG_THAI = '1'
                                                    AND hcthCVD.DON_VI_GUI = '29'
                                                    )
                                                OR hcthCVD.TRANG_THAI IS NULL
                                                )
                                        )
                              )
                          AND (
                                      ST = ''
                                  OR LOWER(hcthCVD.TRICH_YEU) LIKE ST
                                  OR LOWER(dvg.TEN) LIKE ST
                              )
                  )
                 ORDER BY hcthCVD.ID DESC
             )
        WHERE R BETWEEN (pageNumber - 1) * pageSize + 1 AND pageNumber * pageSize;
    RETURN CVD_INFO;
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
WHERE (nhiemVuId is not null and hcthcbn.KEY=nhiemVuId and hcthcbn.LOAI = 'NHIEM_VU')
ORDER BY hcthcbn.ID;
RETURN my_cursor;
END;

/
--EndMethod--

DROP FUNCTION HCTH_GIAO_NHIEM_VU_GET_ALL_LIEN_KET;
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
               DT.TEN_TRUONG            AS "tenCoSoDaoTao",
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

DROP FUNCTION QT_DAO_TAO_GET_CC_CAN_BO;
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
               DT.TEN_TRUONG    AS "tenCoSoDaoTao",
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
                        (select rtrim(xmlagg(xmlelement(e, dmqg.MA_CODE, '-').extract('//text()') order by null).getclobval(), '-')
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

    SELECT COUNT(*)
    INTO totalItem
    FROM TCHC_CAN_BO CB
             LEFT JOIN DM_DON_VI DV on CB.MA_DON_VI = DV.MA
             LEFT JOIN DM_TRINH_DO TRINH_DO ON TRINH_DO.MA = CB.HOC_VI
             LEFT JOIN DM_NGACH_CDNN NG on CB.NGACH = NG.MA
             LEFT JOIN DM_CHUC_DANH_KHOA_HOC CD ON CB.CHUC_DANH = CD.MA
             LEFT JOIN DM_DAN_TOC dmDanToc ON CB.DAN_TOC = dmDanToc.MA
             LEFT JOIN DM_TON_GIAO dmTonGiao ON CB.DAN_TOC = dmTonGiao.MA

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
        OR LOWER(CB.GHI_CHU) LIKE ST);

    IF pageNumber < 1 THEN pageNumber := 1; END IF;
    IF pageSize < 1 THEN pageSize := 1; END IF;
    pageTotal := CEIL(totalItem / pageSize);
    pageNumber := LEAST(pageNumber, pageTotal);

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
                        (select rtrim(xmlagg(xmlelement(e, dmqg.MA_CODE, '-').extract('//text()') order by null).getclobval(), '-')
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
             )
        WHERE R BETWEEN (pageNumber - 1) * pageSize + 1 AND pageNumber * pageSize;
    RETURN canbosys;
end;

/
--EndMethod--

DROP FUNCTION TCCB_DASHBOARD_GET_NUMBER_STAFF_BY_DON_VI;
/
--EndMethod--

DROP FUNCTION TCCB_DASHBOARD_GET_STAFF_DANG_NUOC_NGOAI_BY_MUC_DICH;
/
--EndMethod--

DROP FUNCTION TCCB_DASHBOARD_GET_STAFF_DANG_TRONG_NUOC_BY_MUC_DICH;
/
--EndMethod--

DROP FUNCTION TCCB_DASHBOARD_TOTAL_GENDER;
/
--EndMethod--

