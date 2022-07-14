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
    lastModified    NUMBER;
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
    SELECT JSON_VALUE(filter, '$.lastModified') INTO lastModified FROM DUAL;

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
            AND (lastModified IS NULL OR (CB.LAST_MODIFIED IS NOT NULL AND CB.LAST_MODIFIED >= lastModified))
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
                     DV.MA_PL                                                   AS "loaiDonVi",
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
                     AND (lastModified IS NULL OR (CB.LAST_MODIFIED IS NOT NULL AND CB.LAST_MODIFIED >= lastModified))
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

CREATE OR REPLACE FUNCTION TC_HOC_PHI_DOWNLOAD_PSC(filter IN STRING) RETURN SYS_REFCURSOR
AS
    my_cursor SYS_REFCURSOR;
    namHoc    NUMBER(4);
    hocKy     NUMBER(1);
BEGIN
    SELECT JSON_VALUE(filter, '$.namHoc') INTO namHoc FROM DUAL;
    SELECT JSON_VALUE(filter, '$.hocKy') INTO hocKy FROM DUAL;


    OPEN my_cursor FOR
        SELECT HP.MSSV                                                  AS                            "mssv",
               HP.NAM_HOC                                               AS                            "namHoc",
               HP.HOC_KY                                                AS                            "hocKy",
               HP.CONG_NO                                               AS                            "congNo",
               HP.HOC_PHI                                               AS                            "hocPhi",
               FS.HO                                                    as                            "ho",
               FS.TEN                                                   AS                            "ten",
               FS.GIOI_TINH                                             AS                            "gioiTinh",
               FS.NGAY_SINH                                             AS                            "ngaySinh",
               (FS.HO || ' ' || FS.TEN)                                 AS                            "hoTenSinhVien",
               FS.DIEN_THOAI_CA_NHAN                                    AS                            "soDienThoai",
               FS.EMAIL_CA_NHAN                                         AS                            "emailCaNhan",
               FS.MA_NGANH                                              AS                            "maNganh",
               NDT.TEN_NGANH                                            AS                            "tenNganh",
               DV.TEN                                                   AS                            "tenKhoa",
               LHDT.TEN                                                 AS                            "tenLoaiHinhDaoTao",
               BDT.TEN_BAC                                              AS                            "tenBacDaoTao",
               (SELECT TRANS_DATE
                FROM TC_HOC_PHI_TRANSACTION
                WHERE TRANS_DATE = (SELECT MAX(TRANS_DATE)
                                    FROM TC_HOC_PHI_TRANSACTION TRANS
                                    WHERE HP.HOC_KY = TRANS.HOC_KY
                                      AND HP.NAM_HOC = TRANS.NAM_HOC
                                      AND HP.MSSV = TRANS.CUSTOMER_ID)) AS                            "lastTransaction",

               (SELECT TRANS_ID
                FROM TC_HOC_PHI_TRANSACTION
                WHERE TRANS_DATE = (SELECT MAX(TRANS_DATE)
                                    FROM TC_HOC_PHI_TRANSACTION TRANS
                                    WHERE HP.HOC_KY = TRANS.HOC_KY
                                      AND HP.NAM_HOC = TRANS.NAM_HOC
                                      AND HP.MSSV = TRANS.CUSTOMER_ID)) AS                            "lastTransactionId",

               (SELECT BANK
                FROM TC_HOC_PHI_TRANSACTION
                WHERE TRANS_DATE = (SELECT MAX(TRANS_DATE)
                                    FROM TC_HOC_PHI_TRANSACTION TRANS
                                    WHERE HP.HOC_KY = TRANS.HOC_KY
                                      AND HP.NAM_HOC = TRANS.NAM_HOC
                                      AND HP.MSSV = TRANS.CUSTOMER_ID)) AS                            "dinhDanh",

               ROW_NUMBER() OVER (ORDER BY (SELECT TRANS_DATE
                                            FROM TC_HOC_PHI_TRANSACTION
                                            WHERE TRANS_DATE = (SELECT MAX(TRANS_DATE)
                                                                FROM TC_HOC_PHI_TRANSACTION TRANS
                                                                WHERE HP.HOC_KY = TRANS.HOC_KY
                                                                  AND HP.NAM_HOC = TRANS.NAM_HOC
                                                                  AND HP.MSSV = TRANS.CUSTOMER_ID)) ) R
        FROM TC_HOC_PHI HP
                 LEFT JOIN FW_STUDENT FS
                           on HP.MSSV = FS.MSSV
                 LEFT JOIN DT_NGANH_DAO_TAO NDT on FS.MA_NGANH = NDT.MA_NGANH
                 LEFT JOIN DM_DON_VI DV ON DV.MA = NDT.KHOA
                 LEFT JOIN DM_SV_LOAI_HINH_DAO_TAO LHDT ON FS.LOAI_HINH_DAO_TAO = LHDT.MA
                 LEFT JOIN DM_SV_BAC_DAO_TAO BDT on BDT.MA_BAC = FS.BAC_DAO_TAO
        WHERE (NAM_HOC = namHoc
            AND HOC_KY = hocKy
            AND CONG_NO = 0
            AND EXISTS(SELECT TRANS_ID
                       FROM TC_HOC_PHI_TRANSACTION TRANS
                       WHERE HP.HOC_KY = TRANS.HOC_KY
                         AND HP.NAM_HOC = TRANS.NAM_HOC
                         AND HP.MSSV = TRANS.CUSTOMER_ID
                         AND TRANS.STATUS = 1
                   )
                  );
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
    namHoc    NUMBER(4); listBacDaoTao NVARCHAR2(200);
    hocKy     NUMBER(1); listLoaiHinhDaoTao NVARCHAR2(200);
    daDong    NUMBER(1); listKhoa NVARCHAR2(500);
    listNganh NVARCHAR2(500);
BEGIN
    SELECT JSON_VALUE(filter, '$.namHoc') INTO namHoc FROM DUAL;
    SELECT JSON_VALUE(filter, '$.hocKy') INTO hocKy FROM DUAL;
    SELECT JSON_VALUE(filter, '$.daDong') INTO daDong FROM DUAL;
    SELECT JSON_VALUE(filter, '$.listBacDaoTao') INTO listBacDaoTao FROM DUAL;
    SELECT JSON_VALUE(filter, '$.listLoaiHinhDaoTao') INTO listLoaiHinhDaoTao FROM DUAL;
    SELECT JSON_VALUE(filter, '$.listNganh') INTO listNganh FROM DUAL;
    SELECT JSON_VALUE(filter, '$.listKhoa') INTO listKhoa FROM DUAL;

    SELECT COUNT(*)
    INTO totalItem
    FROM TC_HOC_PHI HP
             LEFT JOIN FW_STUDENT FS on HP.MSSV = FS.MSSV
    WHERE (imssv IS NULL OR imssv = '' OR imssv = HP.MSSV)
        AND (
                  daDong IS NULL OR daDong = ''
                  OR daDong = 1 AND HP.CONG_NO = 0
                  OR daDong = 0 AND HP.CONG_NO != 0
              )
        AND (listNganh IS NULL OR
             listNganh IS NOT NULL AND FS.MA_NGANH IN (SELECT regexp_substr(listNganh, '[^,]+', 1, level)
                                                       from dual
                                                       connect by regexp_substr(listNganh, '[^,]+', 1, level) is not null))
        AND (listKhoa IS NULL OR
             listKhoa IS NOT NULL AND FS.KHOA IN (SELECT regexp_substr(listKhoa, '[^,]+', 1, level)
                                                  from dual
                                                  connect by regexp_substr(listKhoa, '[^,]+', 1, level) is not null))
        AND (listBacDaoTao IS NULL OR
             listBacDaoTao IS NOT NULL AND FS.BAC_DAO_TAO IN (SELECT regexp_substr(listBacDaoTao, '[^,]+', 1, level)
                                                              from dual
                                                              connect by regexp_substr(listBacDaoTao, '[^,]+', 1, level) is not null))
        AND (listLoaiHinhDaoTao IS NULL OR
             listLoaiHinhDaoTao IS NOT NULL AND
             FS.LOAI_HINH_DAO_TAO IN (SELECT regexp_substr(listLoaiHinhDaoTao, '[^,]+', 1, level)
                                      from dual
                                      connect by regexp_substr(listLoaiHinhDaoTao, '[^,]+', 1, level) is not null))
        AND (NAM_HOC = namHoc AND HOC_KY = hocKy)
        AND (searchTerm = ''
            OR LOWER(TRIM(FS.HO || ' ' || FS.TEN)) LIKE sT)
       OR FS.MSSV LIKE ST;

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
                     FS.HO                    as         "ho",
                     FS.TEN                   AS         "ten",
                     FS.GIOI_TINH             AS         "gioiTinh",
                     FS.NGAY_SINH             AS         "ngaySinh",
                     (FS.HO || ' ' || FS.TEN) AS         "hoTenSinhVien",
                     FS.DIEN_THOAI_CA_NHAN    AS         "soDienThoai",
                     FS.EMAIL_CA_NHAN         AS         "emailCaNhan",
                     FS.MA_NGANH              AS         "maNganh",
                     NDT.TEN_NGANH            AS         "tenNganh",
                     DV.TEN                   AS         "tenKhoa",
                     LHDT.TEN                 AS         "tenLoaiHinhDaoTao",
                     BDT.TEN_BAC              AS         "tenBacDaoTao",
                     THPT.TRANS_ID            AS         "lastTransactionId",
                     THPT.TRANS_DATE          AS         "lastTransaction",

--                      (SELECT TRANS_DATE
--                       FROM TC_HOC_PHI_TRANSACTION
--                       WHERE TRANS_DATE = (SELECT MAX(TRANS_DATE)
--                                           FROM TC_HOC_PHI_TRANSACTION TRANS
--                                           WHERE HP.HOC_KY = TRANS.HOC_KY
--                                             AND HP.NAM_HOC = TRANS.NAM_HOC
--                                             AND HP.MSSV = TRANS.CUSTOMER_ID)) AS "lastTransaction",
--
--                      (SELECT TRANS_ID
--                       FROM TC_HOC_PHI_TRANSACTION
--                       WHERE TRANS_DATE = (SELECT MAX(TRANS_DATE)
--                                           FROM TC_HOC_PHI_TRANSACTION TRANS
--                                           WHERE HP.HOC_KY = TRANS.HOC_KY
--                                             AND HP.NAM_HOC = TRANS.NAM_HOC
--                                             AND HP.MSSV = TRANS.CUSTOMER_ID)) AS "lastTransactionId",
                     ROW_NUMBER() OVER (ORDER BY FS.TEN) R
              FROM TC_HOC_PHI HP
                       LEFT JOIN FW_STUDENT FS
                                 on HP.MSSV = FS.MSSV
                       LEFT JOIN DT_NGANH_DAO_TAO NDT on FS.MA_NGANH = NDT.MA_NGANH
                       LEFT JOIN DM_DON_VI DV ON DV.MA = NDT.KHOA
                       LEFT JOIN DM_SV_LOAI_HINH_DAO_TAO LHDT ON FS.LOAI_HINH_DAO_TAO = LHDT.MA
                       LEFT JOIN DM_SV_BAC_DAO_TAO BDT on BDT.MA_BAC = FS.BAC_DAO_TAO
                       LEFT JOIN TC_HOC_PHI_TRANSACTION THPT on HP.HOC_KY = THPT.HOC_KY
                  AND HP.NAM_HOC = THPT.NAM_HOC
                  AND HP.MSSV = THPT.CUSTOMER_ID
                  AND THPT.TRANS_DATE = (SELECT MAX(TRANS_DATE)
                                         FROM TC_HOC_PHI_TRANSACTION TRANS
                                         WHERE HP.HOC_KY = TRANS.HOC_KY
                                           AND HP.NAM_HOC = TRANS.NAM_HOC
                                           AND HP.MSSV = TRANS.CUSTOMER_ID)
              WHERE (imssv IS NULL
                  OR imssv = ''
                  OR imssv = HP.MSSV)
                AND (
                      daDong IS NULL
                      OR daDong = ''
                      OR daDong = 1
                          AND HP.CONG_NO = 0
                      OR daDong = 0
                          AND HP.CONG_NO != 0
                  )
                AND (listNganh IS NULL
                  OR
                     listNganh IS NOT NULL
                         AND FS.MA_NGANH IN (SELECT regexp_substr(listNganh
                                                        , '[^,]+'
                                                        , 1
                                                        , level)
                                             from dual
                                             connect by regexp_substr(listNganh
                                                            , '[^,]+'
                                                            , 1
                                                            , level) is not null))
                AND (listKhoa IS NULL
                  OR
                     listKhoa IS NOT NULL
                         AND FS.KHOA IN (SELECT regexp_substr(listKhoa
                                                    , '[^,]+'
                                                    , 1
                                                    , level)
                                         from dual
                                         connect by regexp_substr(listKhoa
                                                        , '[^,]+'
                                                        , 1
                                                        , level) is not null))
                AND (listBacDaoTao IS NULL
                  OR
                     listBacDaoTao IS NOT NULL
                         AND
                     FS.BAC_DAO_TAO IN (SELECT regexp_substr(listBacDaoTao
                                                   , '[^,]+'
                                                   , 1
                                                   , level)
                                        from dual
                                        connect by regexp_substr(listBacDaoTao
                                                       , '[^,]+'
                                                       , 1
                                                       , level) is not null))
                AND (listLoaiHinhDaoTao IS NULL
                  OR
                     listLoaiHinhDaoTao IS NOT NULL
                         AND
                     FS.LOAI_HINH_DAO_TAO IN (SELECT regexp_substr(listLoaiHinhDaoTao
                                                         , '[^,]+'
                                                         , 1
                                                         , level)
                                              from dual
                                              connect by regexp_substr(listLoaiHinhDaoTao
                                                             , '[^,]+'
                                                             , 1
                                                             , level) is not null))
                AND (HP.NAM_HOC = namHoc
                  AND HP.HOC_KY = hocKy)
                AND (searchTerm = ''
                  OR LOWER(TRIM(FS.HO || ' ' || FS.TEN)) LIKE sT
                  OR FS.MSSV LIKE ST))


        WHERE R BETWEEN (pageNumber - 1) * pageSize + 1 AND pageNumber * pageSize;
    RETURN my_cursor;
END ;

/
--EndMethod--